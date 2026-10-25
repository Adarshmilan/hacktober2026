/**
 * PR description helper: sends the diff (and optionally the repo's PR
 * template and contributing rules) to Gemma for a title and description.
 * Exports: writePrDescription().
 * Depends on: server-only, @/lib/github/*, @/lib/gemma/*,
 *   @/schemas/requests, @/schemas/responses, @/types.
 */
import "server-only";
import { generateJson } from "@/lib/gemma/generate-json";
import { resolveModel } from "@/lib/gemma/list-models";
import { prSystemPrompt } from "@/lib/gemma/prompts/pr";
import { wrapUntrusted } from "@/lib/gemma/prompts/shared";
import { fetchContributing } from "@/lib/github/fetch-contributing";
import { fetchTree } from "@/lib/github/fetch-tree";
import { parseRepoUrl } from "@/lib/github/parse-repo-url";
import { REQUEST_LIMITS } from "@/schemas/requests";
import { prResultSchema } from "@/schemas/responses";
import type { PrRequest, PrResult, RepoFile } from "@/types";

const BUDGET = { contributing: 3_000, template: 3_000 } as const;

const fileBlock = (label: string, file: RepoFile, maxChars: number) =>
  wrapUntrusted(label, `path: ${file.path}\n\n${file.text}`, maxChars);

async function styleContext(repoUrl: string): Promise<string[]> {
  const ref = parseRepoUrl(repoUrl);
  const tree = await fetchTree(ref);
  const docs = await fetchContributing(ref, tree.paths);
  const blocks = [`Repository: ${ref.owner}/${ref.repo}`];
  if (docs?.pullRequestTemplate) {
    blocks.push(fileBlock("pr_template", docs.pullRequestTemplate, BUDGET.template));
  }
  if (docs?.contributing) {
    blocks.push(fileBlock("contributing", docs.contributing, BUDGET.contributing));
  }
  return blocks;
}

export async function writePrDescription(request: PrRequest): Promise<PrResult> {
  const model = await resolveModel(request.model);
  const blocks = [wrapUntrusted("diff", request.diff, REQUEST_LIMITS.maxDiffChars)];
  if (request.repoUrl) blocks.push(...(await styleContext(request.repoUrl)));

  return generateJson({
    model,
    systemPrompt: prSystemPrompt(request.language),
    userContent: blocks.join("\n\n"),
    schema: prResultSchema,
    maxOutputTokens: 3_000,
  });
}
