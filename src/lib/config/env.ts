/**
 * Server-only environment configuration.
 * Exports: getEnv() which returns validated settings, and the AppEnv type.
 * Depends on: zod, server-only.
 *
 * Validation runs on first use, not at import time, so `next build` and the
 * test suite work on machines without keys. A missing key still fails loudly
 * the first time a request needs it.
 */
import "server-only";
import { z } from "zod";

// Blank lines in .env files arrive as "", which should mean "not set".
const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const envSchema = z.object({
  GEMINI_API_KEY: z.preprocess(
    blankToUndefined,
    z.string().min(1).optional(),
  ),
  GEMMA_MODEL: z.preprocess(
    (value) => {
      const blank = blankToUndefined(value);
      return typeof blank === "string" ? blank.trim().replace(/^models\//, "") : "gemma4:e2b";
    },
    z
      .string()
      .default("gemma4:e2b"),
  ),
  OLLAMA_BASE_URL: z.preprocess(
    blankToUndefined,
    z.string().default("http://localhost:11434"),
  ),
  GITHUB_TOKEN: z.preprocess(blankToUndefined, z.string().min(1).optional()),
  MAX_IMAGE_MB: z.preprocess(blankToUndefined, z.coerce.number().positive().max(20).default(4)),
  RATE_LIMIT_PER_MIN: z.preprocess(
    blankToUndefined,
    z.coerce.number().int().positive().max(1000).default(20),
  ),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | undefined;

export function getEnv(): AppEnv {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // Only variable names and rule messages are reported, never values.
    const problems = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration. ${problems}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}
