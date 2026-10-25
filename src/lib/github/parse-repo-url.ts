/**
 * Strictly parses user input into a GitHub { owner, repo } pair.
 * Exports: parseRepoUrl().
 * Depends on: @/lib/http/api-error, @/types.
 *
 * This is the SSRF gate: only github.com URLs or "owner/repo" strings pass,
 * and only the two validated names leave this function. The input URL itself
 * is never fetched.
 */
import { ApiError } from "@/lib/http/api-error";
import type { RepoRef } from "@/types";

// GitHub usernames: letters, digits and inner hyphens, at most 39 characters.
const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPO_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;
const ALLOWED_HOSTS = new Set(["github.com", "www.github.com"]);
// Whitespace, backslashes, credentials ("user@") and percent-encoding are never
// needed for a public repo URL and are common in bypass attempts.
const FORBIDDEN_CHARS = /[\s\\@%]/;
const MAX_INPUT_CHARS = 200;
// URL parsing would silently resolve "." and ".." segments, so reject them up front.
const DOT_SEGMENT = /(^|\/)\.\.?(\/|$)/;

const invalid = () =>
  new ApiError("INVALID_INPUT", {
    safeMessage:
      "Enter a public GitHub repository like owner/repo or https://github.com/owner/repo.",
  });

function isShorthand(input: string): boolean {
  return !input.includes(":") && !/^(www\.)?github\.com\//i.test(input);
}

function shorthandSegments(input: string): string[] {
  const segments = input.split("/");
  if (segments.length !== 2) throw invalid();
  return segments;
}

function urlSegments(input: string): string[] {
  const withScheme = /^https?:\/\//i.test(input) ? input : `https://${input}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw invalid();
  }

  const isAllowed =
    (url.protocol === "https:" || url.protocol === "http:") &&
    ALLOWED_HOSTS.has(url.hostname) &&
    url.port === "" &&
    url.username === "" &&
    url.password === "";
  if (!isAllowed) throw invalid();

  // Extra segments such as /tree/main/src are allowed and ignored.
  return url.pathname.split("/").filter((segment) => segment.length > 0);
}

export function parseRepoUrl(input: string): RepoRef {
  const trimmed = input.trim().replace(/\/+$/, "");
  if (
    trimmed.length === 0 ||
    trimmed.length > MAX_INPUT_CHARS ||
    FORBIDDEN_CHARS.test(trimmed) ||
    DOT_SEGMENT.test(trimmed)
  ) {
    throw invalid();
  }

  const [owner, rawRepo] = isShorthand(trimmed) ? shorthandSegments(trimmed) : urlSegments(trimmed);
  const repo = rawRepo?.replace(/\.git$/i, "");

  if (!owner || !repo || !OWNER_PATTERN.test(owner) || !REPO_PATTERN.test(repo)) throw invalid();
  if (repo === "." || repo === "..") throw invalid();

  return { owner, repo };
}
