/**
 * Fetches open issues for a repo, excluding pull requests.
 * Exports: fetchIssues().
 * Depends on: zod, @/lib/github/client, @/lib/utils/trim-content, @/types.
 */
import { z } from "zod";
import { githubFetch, repoPath } from "@/lib/github/client";
import { trimContent } from "@/lib/utils/trim-content";
import type { GitHubIssue, RepoRef } from "@/types";

const PER_PAGE = 100;
const MAX_BODY_CHARS = 1_500;

const labelSchema = z.union([z.string(), z.object({ name: z.string().nullish() })]);

const issueSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().max(1_000),
  html_url: z.string().startsWith("https://github.com/"),
  labels: z.array(labelSchema),
  comments: z.number().int().nonnegative(),
  created_at: z.string(),
  body: z.string().nullish(),
  assignee: z.unknown().nullish(),
  pull_request: z.unknown().optional(),
});

function labelName(label: z.infer<typeof labelSchema>): string {
  return typeof label === "string" ? label : (label.name ?? "");
}

export async function fetchIssues(ref: RepoRef): Promise<GitHubIssue[]> {
  const json = await githubFetch(
    `${repoPath(ref, "issues")}?state=open&per_page=${PER_PAGE}&sort=created&direction=desc`,
  );
  if (!Array.isArray(json)) return [];

  return json.flatMap((item): GitHubIssue[] => {
    const parsed = issueSchema.safeParse(item);
    // The issues endpoint also returns pull requests; skip them and anything malformed.
    if (!parsed.success || parsed.data.pull_request !== undefined) return [];

    const issue = parsed.data;
    return [
      {
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        labels: issue.labels.map(labelName).filter((name) => name.length > 0),
        comments: issue.comments,
        createdAt: issue.created_at,
        body: trimContent(issue.body ?? "", MAX_BODY_CHARS),
        isAssigned: issue.assignee !== null && issue.assignee !== undefined,
      },
    ];
  });
}
