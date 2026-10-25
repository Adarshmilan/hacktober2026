/**
 * POST /api/explain: explains how a repo is organized and how to run it.
 * Exports: POST.
 * Depends on: @/lib/http/route-helpers, @/lib/services/explain-service, @/schemas/requests.
 */
import { parseJsonBody, withRoute } from "@/lib/http/route-helpers";
import { explainRepo } from "@/lib/services/explain-service";
import { explainRequestSchema } from "@/schemas/requests";

export const POST = withRoute("explain", async (request) =>
  explainRepo(await parseJsonBody(request, explainRequestSchema)),
);
