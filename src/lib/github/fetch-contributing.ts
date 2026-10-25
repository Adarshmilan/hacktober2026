/**
 * Fetches a repo's CONTRIBUTING guide and issue / pull request templates.
 * Exports: fetchContributing().
 * Depends on: @/lib/github/client, @/types.
 *
 * Candidates are found in the already-fetched file tree, so missing files cost
 * no extra requests.
 */
import { fetchRepoFile } from "@/lib/github/client";
import type { ContributingDocs, RepoFile, RepoRef } from "@/types";

const MAX_ISSUE_TEMPLATES = 2;

const CONTRIBUTING = /^(\.github\/|docs\/)?contributing(\.md|\.rst|\.txt)?$/i;
const PR_TEMPLATE = /^(\.github\/|docs\/)?pull_request_template(\.md|\/[^/]+\.md)$/i;
const ISSUE_TEMPLATE = /^(\.github\/)?issue_template(\.md|\/[^/]+\.(md|ya?ml))$/i;

// Root files beat .github/ which beats docs/; shorter paths are more canonical.
const byShortestPath = (a: string, b: string) => a.length - b.length || a.localeCompare(b);

function pickIssueTemplates(paths: string[]): string[] {
  // config.yml configures GitHub's template chooser and is not a template itself.
  const candidates = paths.filter(
    (path) => ISSUE_TEMPLATE.test(path) && !/\/config\.ya?ml$/i.test(path),
  );
  // Bug templates are the most useful for the bug-report feature.
  const bugFirst = [...candidates].sort(
    (a, b) => Number(/bug/i.test(b)) - Number(/bug/i.test(a)) || byShortestPath(a, b),
  );
  return bugFirst.slice(0, MAX_ISSUE_TEMPLATES);
}

const firstMatch = (paths: string[], pattern: RegExp) =>
  paths.filter((path) => pattern.test(path)).sort(byShortestPath)[0];

async function fetchOptional(ref: RepoRef, path: string | undefined): Promise<RepoFile | null> {
  if (!path) return null;
  const file = await fetchRepoFile(ref, path);
  return file && file.text.trim().length > 0 ? file : null;
}

/** Returns null when the repo has none of these files. */
export async function fetchContributing(
  ref: RepoRef,
  treePaths: string[],
): Promise<ContributingDocs | null> {
  const [contributing, pullRequestTemplate, ...issueTemplates] = await Promise.all([
    fetchOptional(ref, firstMatch(treePaths, CONTRIBUTING)),
    fetchOptional(ref, firstMatch(treePaths, PR_TEMPLATE)),
    ...pickIssueTemplates(treePaths).map((path) => fetchOptional(ref, path)),
  ]);

  const docs: ContributingDocs = {
    contributing: contributing ?? null,
    pullRequestTemplate: pullRequestTemplate ?? null,
    issueTemplates: issueTemplates.filter((file): file is RepoFile => file !== null),
  };

  const isEmpty =
    !docs.contributing && !docs.pullRequestTemplate && docs.issueTemplates.length === 0;
  return isEmpty ? null : docs;
}
