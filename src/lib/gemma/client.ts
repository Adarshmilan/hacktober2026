/**
 * Creates the Google GenAI SDK client used to call Gemma.
 * Exports: getGemmaClient().
 * Depends on: @google/genai, server-only, @/lib/config/env.
 */
import "server-only";
import { GoogleGenAI } from "@google/genai";
import { getEnv } from "@/lib/config/env";

let client: GoogleGenAI | undefined;

export function getGemmaClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || getEnv().GEMINI_API_KEY || "";
  if (customApiKey) {
    return new GoogleGenAI({
      apiKey: customApiKey,
      httpOptions: { timeout: 60_000, retryOptions: { attempts: 2 } },
    });
  }
  client ??= new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: 60_000, retryOptions: { attempts: 2 } },
  });
  return client;
}
