/**
 * POST /api/pr: writes a PR title and description from a diff.
 * Exports: POST.
 * Depends on: @/lib/http/route-helpers, @/lib/services/pr-service, @/schemas/requests.
 */
import { parseJsonBody, withRoute } from "@/lib/http/route-helpers";
import { writePrDescription } from "@/lib/services/pr-service";
import { prRequestSchema } from "@/schemas/requests";

export const POST = withRoute("pr", async (request) =>
  writePrDescription(await parseJsonBody(request, prRequestSchema)),
);
