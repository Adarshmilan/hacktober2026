/**
 * Repo explainer: fetches README, file tree and CONTRIBUTING, asks Gemma to
 * explain the repo, then checks every cited path against the real files.
 * Exports: explainRepo().
 * Depends on: server-only, @/lib/cache/memory-cache, @/lib/github/*,
 *   @/lib/gemma/*, @/lib/utils/verify-paths, @/schemas/responses, @/types.
 */
import "server-only";
import { MemoryCache } from "@/lib/cache/memory-cache";
import { generateJson } from "@/lib/gemma/generate-json";
import { resolveModel } from "@/lib/gemma/list-models";
import { explainSystemPrompt } from "@/lib/gemma/prompts/explain";
import { wrapUntrusted } from "@/lib/gemma/prompts/shared";
import { fetchContributing } from "@/lib/github/fetch-contributing";
import { fetchReadme } from "@/lib/github/fetch-readme";
import { fetchTree } from "@/lib/github/fetch-tree";
import { parseRepoUrl } from "@/lib/github/parse-repo-url";
import { createPathResolver } from "@/lib/utils/verify-paths";
import { explainResultSchema } from "@/schemas/responses";
import type { ExplainRequest, ExplainResult, RepoFile } from "@/types";

const BUDGET = { readme: 12_000, tree: 8_000, contributing: 4_000 } as const;
const cache = new MemoryCache<ExplainResult>({ ttlMs: 30 * 60_000, maxEntries: 100 });

const fileBlock = (label: string, file: RepoFile, maxChars: number) =>
  wrapUntrusted(label, `path: ${file.path}\n\n${file.text}`, maxChars);

/** Replaces uncited or invented paths with "unknown" and drops bad entries. */
function verifyCitations(result: ExplainResult, knownPaths: string[]): ExplainResult {
  const resolve = createPathResolver(knownPaths);
  const source = (path: string) => resolve(path) ?? "unknown";

  return {
    ...result,
    techStack: result.techStack.map((item) => ({ ...item, source: source(item.source) })),
    howToRunLocally: result.howToRunLocally.map((item) => ({
      ...item,
      source: source(item.source),
    })),
    folders: result.folders.flatMap((item) => {
      const path = resolve(item.path);
      return path ? [{ ...item, path }] : [];
    }),
    whereToStart: result.whereToStart.flatMap((item) => {
      const path = resolve(item.path);
      return path ? [{ ...item, path }] : [];
    }),
    sources: [...new Set(result.sources.flatMap((path) => resolve(path) ?? []))],
  };
}

export async function explainRepo(request: ExplainRequest): Promise<ExplainResult> {
  const ref = parseRepoUrl(request.repoUrl);
  const model = await resolveModel(request.model);
  const cacheKey = `${ref.owner}/${ref.repo}|${request.language}|${model}`.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // The tree call doubles as the existence check (404 -> REPO_NOT_FOUND).
  const tree = await fetchTree(ref);
  const [readme, docs] = await Promise.all([fetchReadme(ref), fetchContributing(ref, tree.paths)]);

  const blocks = [
    `Repository: ${ref.owner}/${ref.repo}`,
    wrapUntrusted("file_tree", tree.paths.join("\n"), BUDGET.tree),
    readme ? fileBlock("readme", readme, BUDGET.readme) : "No README was found.",
    docs?.contributing
      ? fileBlock("contributing", docs.contributing, BUDGET.contributing)
      : "No CONTRIBUTING file was found.",
  ];

  const raw = await generateJson({
    model,
    systemPrompt: explainSystemPrompt(request.language),
    userContent: blocks.join("\n\n"),
    schema: explainResultSchema,
    maxOutputTokens: 3_000,
  });

  const knownPaths = [...tree.paths, readme?.path, docs?.contributing?.path].filter(
    (path): path is string => typeof path === "string",
  );
  const result = verifyCitations(raw, knownPaths);
  cache.set(cacheKey, result);
  return result;
}
