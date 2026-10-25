/**
 * Good-first-issue finder: picks the most promising open issues, asks Gemma
 * to rank and explain them, and attaches real titles and links from GitHub.
 * Exports: findBeginnerIssues().
 * Depends on: server-only, @/lib/cache/memory-cache, @/lib/github/*,
 *   @/lib/gemma/*, @/lib/utils/verify-paths, @/schemas/responses, @/types.
 */
import "server-only";
import { MemoryCache } from "@/lib/cache/memory-cache";
import { generateJson } from "@/lib/gemma/generate-json";
import { resolveModel } from "@/lib/gemma/list-models";
import { issuesSystemPrompt } from "@/lib/gemma/prompts/issues";
import { wrapUntrusted } from "@/lib/gemma/prompts/shared";
import { fetchIssues } from "@/lib/github/fetch-issues";
import { fetchTree } from "@/lib/github/fetch-tree";
import { parseRepoUrl } from "@/lib/github/parse-repo-url";
import { createPathResolver } from "@/lib/utils/verify-paths";
import { issueRankingModelSchema } from "@/schemas/responses";
import type { GitHubIssue, IssuesData, IssuesRequest } from "@/types";

const BATCH_SIZE = 15;
const BUDGET = { issues: 18_000, tree: 5_000 } as const;
const BEGINNER_LABEL =
  /good.?first|beginner|easy|first.?timers|starter|help.?wanted|hacktoberfest|documentation|\bdocs?\b/i;
const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 } as const;
const cache = new MemoryCache<IssuesData>({ ttlMs: 10 * 60_000, maxEntries: 100 });

// Cheap pre-filter so the model sees the most promising issues first.
function beginnerScore(issue: GitHubIssue): number {
  const labelBonus = issue.labels.some((label) => BEGINNER_LABEL.test(label)) ? 10 : 0;
  return labelBonus - Math.min(issue.comments, 20) * 0.3;
}

function formatIssue(issue: GitHubIssue): string {
  const labels = issue.labels.join(", ") || "none";
  return `#${issue.number} | title: ${issue.title} | labels: ${labels} | comments: ${issue.comments} | opened: ${issue.createdAt.slice(0, 10)}\n${issue.body || "(no description)"}`;
}

export async function findBeginnerIssues(request: IssuesRequest): Promise<IssuesData> {
  const ref = parseRepoUrl(request.repoUrl);
  const model = await resolveModel(request.model);
  const cacheKey = `${ref.owner}/${ref.repo}|${request.language}|${model}`.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const tree = await fetchTree(ref);
  const batch = (await fetchIssues(ref))
    .filter((issue) => !issue.isAssigned)
    .sort((a, b) => beginnerScore(b) - beginnerScore(a))
    .slice(0, BATCH_SIZE);
  if (batch.length === 0) return { issues: [] };

  const output = await generateJson({
    model,
    systemPrompt: issuesSystemPrompt(request.language),
    userContent: [
      `Repository: ${ref.owner}/${ref.repo}`,
      wrapUntrusted("issues", batch.map(formatIssue).join("\n---\n"), BUDGET.issues),
      wrapUntrusted("file_tree", tree.paths.join("\n"), BUDGET.tree),
    ].join("\n\n"),
    schema: issueRankingModelSchema,
    maxOutputTokens: 4_000,
  });

  const byNumber = new Map(batch.map((issue) => [issue.number, issue]));
  const resolvePath = createPathResolver(tree.paths);
  const seen = new Set<number>();

  const issues = output.issues
    .flatMap((ranking) => {
      const issue = byNumber.get(ranking.number);
      // Drop numbers the model invented or repeated.
      if (!issue || seen.has(ranking.number)) return [];
      seen.add(ranking.number);
      const likelyFiles = ranking.likelyFiles.flatMap((path) => resolvePath(path) ?? []);
      return [{ ...ranking, likelyFiles, title: issue.title.slice(0, 500), url: issue.url }];
    })
    .sort(
      (a, b) =>
        DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] ||
        b.confidence - a.confidence,
    );

  const result = { issues };
  cache.set(cacheKey, result);
  return result;
}
