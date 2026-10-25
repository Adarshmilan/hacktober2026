/**
 * Creates the Google GenAI SDK client used to call Gemma.
 * Exports: getGemmaClient().
 * Depends on: @google/genai, server-only, @/lib/config/env.
 */
import "server-only";
import { GoogleGenAI } from "@google/genai";
import { getEnv } from "@/lib/config/env";

let client: GoogleGenAI | undefined;

export function getGemmaClient(): GoogleGenAI {
  client ??= new GoogleGenAI({
    apiKey: getEnv().GEMINI_API_KEY,
    // The SDK default retries up to 5 times with long backoff, which would leave
    // users waiting minutes. generate-json does its own single repair retry.
    httpOptions: { timeout: 60_000, retryOptions: { attempts: 2 } },
  });
  return client;
}
