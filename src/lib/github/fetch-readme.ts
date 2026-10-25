/**
 * Fetches a repo's README, whatever its name or location.
 * Exports: fetchReadme().
 * Depends on: @/lib/github/client, @/types.
 */
import { decodeContentFile, githubFetch, repoPath } from "@/lib/github/client";
import type { RepoFile, RepoRef } from "@/types";

/** Returns null when the repo has no README. */
export async function fetchReadme(ref: RepoRef): Promise<RepoFile | null> {
  const json = await githubFetch(repoPath(ref, "readme"), { nullOnStatus: [404] });
  return json === null ? null : decodeContentFile(json);
}
