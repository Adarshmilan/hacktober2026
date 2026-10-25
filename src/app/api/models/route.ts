/**
 * GET /api/models: lists the Gemma models users can pick from.
 * Exports: GET.
 * Depends on: @/lib/config/env, @/lib/gemma/list-models, @/lib/http/route-helpers, @/types.
 */
import { getEnv } from "@/lib/config/env";
import { listGemmaModels } from "@/lib/gemma/list-models";
import { withRoute } from "@/lib/http/route-helpers";
import type { ModelsData } from "@/types";

export const GET = withRoute("models", async (): Promise<ModelsData> => ({
  models: await listGemmaModels(),
  defaultModel: getEnv().GEMMA_MODEL,
}));
