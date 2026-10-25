/**
 * The single entry point every service uses to call Gemma.
 * Exports: generateJson(), extractJson().
 * Depends on: @google/genai (types), zod, server-only, @/lib/gemma/client,
 *   @/lib/http/api-error, @/lib/utils/logger, @/types.
 *
 * Sends the prompt (and optional image), parses the reply as JSON, validates
 * it with Zod, and retries once with a repair instruction before giving up
 * with a MODEL_ERROR.
 */
import "server-only";
import { ThinkingLevel, type GenerateContentConfig, type Part } from "@google/genai";
import type { z } from "zod";
import { getGemmaClient } from "@/lib/gemma/client";
import { ApiError } from "@/lib/http/api-error";
import { logger } from "@/lib/utils/logger";
import type { ValidatedImage } from "@/types";

interface GenerateJsonOptions<S extends z.ZodType> {
  model: string;
  systemPrompt: string;
  userContent: string;
  schema: S;
  image?: ValidatedImage;
  maxOutputTokens?: number;
}

type ParseResult<T> = { success: true; data: T } | { success: false; problem: string };

const SERVER_ERROR_RETRY_DELAY_MS = 1_000;

function errorStatus(error: unknown): number | undefined {
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === "number" ? status : undefined;
}

const isServerError = (error: unknown) => (errorStatus(error) ?? 0) >= 500;

/** Pulls the JSON object out of a reply that may include fences or extra text. */
export function extractJson(text: string): unknown {
  const unfenced = text.replace(/```(?:json)?/gi, "");
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start === -1 || end <= start) throw new SyntaxError("No JSON object in model reply");
  return JSON.parse(unfenced.slice(start, end + 1));
}

function parseReply<S extends z.ZodType>(text: string, schema: S): ParseResult<z.infer<S>> {
  let json: unknown;
  try {
    json = extractJson(text);
  } catch {
    return { success: false, problem: "the reply was not a valid JSON object" };
  }

  const result = schema.safeParse(json);
  if (result.success) return { success: true, data: result.data };

  // Only field paths and rule messages are reused; never the reply text itself.
  const problem = result.error.issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("; ");
  return { success: false, problem };
}

function modelConfig(model: string, systemPrompt: string, maxOutputTokens: number) {
  const config: GenerateContentConfig = {
    systemInstruction: systemPrompt,
    temperature: 0.2,
    maxOutputTokens,
  };
  // Gemma 4 thinks by default; minimal thinking keeps answers fast. Older Gemma
  // versions do not support the setting at all.
  if (model.startsWith("gemma-4")) config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
  return config;
}

async function callModel(
  options: GenerateJsonOptions<z.ZodType>,
  userText: string,
): Promise<string> {
  const parts: Part[] = [];
  if (options.image) {
    parts.push({ inlineData: { mimeType: options.image.mimeType, data: options.image.base64 } });
  }
  parts.push({ text: userText });

  const request = () =>
    getGemmaClient().models.generateContent({
      model: options.model,
      contents: [{ role: "user", parts }],
      config: modelConfig(options.model, options.systemPrompt, options.maxOutputTokens ?? 4096),
    });

  try {
    try {
      return (await request()).text ?? "";
    } catch (error) {
      // The API sometimes returns a transient 500 for longer prompts; one quick
      // retry usually succeeds and saves the user a manual resubmit.
      if (!isServerError(error)) throw error;
      logger.warn({ event: "model_server_error_retry", status: errorStatus(error) });
      await new Promise((resolve) => setTimeout(resolve, SERVER_ERROR_RETRY_DELAY_MS));
      return (await request()).text ?? "";
    }
  } catch (error) {
    const status = errorStatus(error);
    if (status === 429) {
      throw new ApiError("MODEL_ERROR", {
        status: 503,
        safeMessage: "The AI model is busy or the API quota is used up. Try again in a minute.",
        cause: error,
      });
    }
    throw new ApiError("MODEL_ERROR", { cause: error });
  }
}

export async function generateJson<S extends z.ZodType>(
  options: GenerateJsonOptions<S>,
): Promise<z.infer<S>> {
  const first = parseReply(await callModel(options, options.userContent), options.schema);
  if (first.success) return first.data;

  logger.warn({ event: "model_json_retry", detail: first.problem });
  const repairNote = `Your previous answer could not be used because ${first.problem}. Answer again with only the JSON object in the exact required shape.`;
  const second = parseReply(
    await callModel(options, `${options.userContent}\n\n${repairNote}`),
    options.schema,
  );
  if (second.success) return second.data;

  throw new ApiError("MODEL_ERROR", { cause: new Error(`Invalid model JSON: ${second.problem}`) });
}
