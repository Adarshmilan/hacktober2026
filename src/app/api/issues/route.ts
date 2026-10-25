/**
 * POST /api/issues: ranks open issues by beginner-friendliness.
 * Exports: POST.
 * Depends on: @/lib/http/route-helpers, @/lib/services/issues-service, @/schemas/requests.
 */
import { parseJsonBody, withRoute } from "@/lib/http/route-helpers";
import { findBeginnerIssues } from "@/lib/services/issues-service";
import { issuesRequestSchema } from "@/schemas/requests";

export const POST = withRoute("issues", async (request) =>
  findBeginnerIssues(await parseJsonBody(request, issuesRequestSchema)),
);
