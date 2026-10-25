/**
 * Lists the Gemma models the configured API key can use, and checks that a
 * user-chosen model is one of them.
 * Exports: listGemmaModels(), resolveModel().
 * Depends on: server-only, @/lib/cache/memory-cache, @/lib/config/env,
 *   @/lib/gemma/client, @/lib/http/api-error, @/lib/utils/logger, @/types.
 *
 * Users may only pick from this live list, so nobody can send an arbitrary
 * (possibly expensive, non-Gemma) model name through the app.
 */
import "server-only";
import { MemoryCache } from "@/lib/cache/memory-cache";
import { getEnv } from "@/lib/config/env";
import { getGemmaClient } from "@/lib/gemma/client";
import { ApiError } from "@/lib/http/api-error";
import { logger } from "@/lib/utils/logger";
import type { GemmaModelInfo } from "@/types";

const GEMMA_ID = /^gemma-[a-z0-9.-]{1,60}$/;
const MAX_MODELS = 50;
const cache = new MemoryCache<GemmaModelInfo[]>({ ttlMs: 10 * 60_000, maxEntries: 1 });

async function fetchGemmaModels(): Promise<GemmaModelInfo[]> {
  const pager = await getGemmaClient().models.list({ config: { pageSize: 100 } });
  const models: GemmaModelInfo[] = [];

  for await (const model of pager) {
    const id = model.name?.replace(/^models\//, "") ?? "";
    if (!GEMMA_ID.test(id)) continue;
    if (model.supportedActions && !model.supportedActions.includes("generateContent")) continue;
    models.push({ id, displayName: model.displayName?.slice(0, 100) || id });
    if (models.length >= MAX_MODELS) break;
  }
  return models;
}

/** The configured default model always comes first. */
export async function listGemmaModels(): Promise<GemmaModelInfo[]> {
  const cached = cache.get("models");
  if (cached) return cached;

  const defaultModel = getEnv().GEMMA_MODEL;
  let models: GemmaModelInfo[];
  try {
    models = await fetchGemmaModels();
  } catch (error) {
    // Listing is a convenience; the app still works with the default model.
    logger.warn({
      event: "model_list_failed",
      detail: error instanceof Error ? error.message : "unknown error",
    });
    return [{ id: defaultModel, displayName: defaultModel }];
  }

  const others = models.filter((model) => model.id !== defaultModel);
  const fromList = models.find((model) => model.id === defaultModel);
  const sorted = [fromList ?? { id: defaultModel, displayName: defaultModel }, ...others];
  cache.set("models", sorted);
  return sorted;
}

export async function resolveModel(requested: string | undefined): Promise<string> {
  const defaultModel = getEnv().GEMMA_MODEL;
  if (!requested || requested === defaultModel) return defaultModel;

  const models = await listGemmaModels();
  if (models.some((model) => model.id === requested)) return requested;

  throw new ApiError("INVALID_INPUT", {
    safeMessage: "That model is not available. Pick one from the list.",
  });
}
