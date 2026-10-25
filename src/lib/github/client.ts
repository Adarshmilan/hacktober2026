/**
 * The only code that talks to GitHub. Every request goes to the fixed host
 * https://api.github.com.
 * Exports: githubFetch(), repoPath(), fetchRepoFile(), decodeContentFile().
 * Depends on: zod, server-only, @/lib/config/env, @/lib/http/api-error, @/types.
 *
 * Paths are built from validated names with each segment URL-encoded, and the
 * final URL is checked again before sending, so user input cannot redirect a
 * request to another host or path.
 */
import "server-only";
import { z } from "zod";
import { getEnv } from "@/lib/config/env";
import { ApiError } from "@/lib/http/api-error";
import type { RepoFile, RepoRef } from "@/types";

const GITHUB_ORIGIN = "https://api.github.com";
const TIMEOUT_MS = 10_000;
const MAX_FILE_CHARS = 200_000;

interface GitHubFetchOptions {
  /** Statuses that mean "nothing here" for this call and should return null. */
  nullOnStatus?: readonly number[];
}

function encodeSegment(segment: string): string {
  if (segment === "" || segment === "." || segment === "..") {
    throw new Error("Unsafe GitHub path segment.");
  }
  return encodeURIComponent(segment);
}

/** Builds /repos/{owner}/{repo}/... with every segment encoded. */
export function repoPath(ref: RepoRef, ...segments: string[]): string {
  return `/repos/${[ref.owner, ref.repo, ...segments].map(encodeSegment).join("/")}`;
}

function retryAfterSeconds(response: Response): number {
  const retryAfter = Number(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter, 3600);

  const reset = Number(response.headers.get("x-ratelimit-reset"));
  if (!Number.isFinite(reset) || reset <= 0) return 60;
  return Math.min(Math.max(1, Math.ceil(reset - Date.now() / 1000)), 3600);
}

function toGitHubError(response: Response): ApiError {
  const { status } = response;
  const cause = new Error(`GitHub responded with ${status}`);
  const rateLimited =
    status === 429 ||
    (status === 403 &&
      (response.headers.get("x-ratelimit-remaining") === "0" ||
        response.headers.has("retry-after")));

  if (rateLimited) {
    return new ApiError("GITHUB_RATE_LIMIT", {
      retryAfterSeconds: retryAfterSeconds(response),
      cause,
    });
  }
  if (status === 404 || status === 403 || status === 451)
    return new ApiError("REPO_NOT_FOUND", { cause });
  if (status === 401) {
    return new ApiError("INTERNAL", { cause: new Error("GitHub rejected GITHUB_TOKEN (401)") });
  }
  return new ApiError("INTERNAL", {
    status: 502,
    safeMessage: "GitHub returned an unexpected error. Please try again.",
    cause,
  });
}

export async function githubFetch(
  path: string,
  options: GitHubFetchOptions = {},
): Promise<unknown | null> {
  const url = new URL(path, GITHUB_ORIGIN);
  // Rejects anything URL parsing would rewrite, such as "..", "//host" or a full URL.
  if (url.origin !== GITHUB_ORIGIN || url.pathname !== path.split("?")[0]) {
    throw new Error("Refusing to call a URL outside the GitHub API.");
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "opensource-contributor-helper",
  };
  const token = getEnv().GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError("INTERNAL", {
      status: 502,
      safeMessage: "Could not reach GitHub. Please try again.",
      cause: error,
    });
  }

  // Redirects (e.g. renamed repos) must stay on the API host.
  if (new URL(response.url).origin !== GITHUB_ORIGIN) {
    throw new ApiError("INTERNAL", { cause: new Error("GitHub redirected off-host") });
  }
  if (options.nullOnStatus?.includes(response.status)) return null;
  if (!response.ok) throw toGitHubError(response);

  return (await response.json()) as unknown;
}

const contentFileSchema = z.object({
  type: z.literal("file"),
  path: z.string().min(1).max(300),
  content: z.string(),
  encoding: z.literal("base64"),
});

/** Decodes a GitHub "contents" API file. Returns null for files too big to inline. */
export function decodeContentFile(json: unknown): RepoFile | null {
  const parsed = contentFileSchema.safeParse(json);
  if (!parsed.success) return null;
  const text = Buffer.from(parsed.data.content, "base64").toString("utf8");
  return { path: parsed.data.path, text: text.slice(0, MAX_FILE_CHARS) };
}

export async function fetchRepoFile(ref: RepoRef, filePath: string): Promise<RepoFile | null> {
  const json = await githubFetch(repoPath(ref, "contents", ...filePath.split("/")), {
    nullOnStatus: [404],
  });
  return json === null ? null : decodeContentFile(json);
}
