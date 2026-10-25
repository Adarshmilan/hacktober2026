/**
 * Fetches the repo's file list (paths only), without noise such as
 * dependencies, build output, lock files, images and binaries.
 * Exports: fetchTree(), isUsefulPath(), MAX_TREE_PATHS.
 * Depends on: zod, @/lib/github/client, @/lib/http/api-error, @/types.
 */
import { z } from "zod";
import { githubFetch, repoPath } from "@/lib/github/client";
import { ApiError } from "@/lib/http/api-error";
import type { RepoRef, RepoTree } from "@/types";

export const MAX_TREE_PATHS = 400;
const MAX_PATH_CHARS = 300;

const IGNORED_DIRS = new Set([
  "node_modules",
  "bower_components",
  "vendor",
  "dist",
  "build",
  "out",
  ".next",
  ".nuxt",
  "target",
  "coverage",
  "__pycache__",
  ".venv",
  "venv",
  ".git",
  ".cache",
  ".turbo",
  ".gradle",
]);

const IGNORED_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "bun.lock",
  "cargo.lock",
  "poetry.lock",
  "composer.lock",
  "gemfile.lock",
  "go.sum",
  "pipfile.lock",
  ".ds_store",
]);

const IGNORED_EXTENSIONS =
  /\.(png|jpe?g|gif|webp|bmp|ico|svg|avif|pdf|zip|gz|tgz|tar|rar|7z|jar|war|exe|dll|so|dylib|bin|class|pyc|o|a|woff2?|ttf|otf|eot|mp[34]|wav|ogg|mov|avi|webm|map|lock)$/i;

const treeSchema = z.object({
  tree: z.array(z.object({ path: z.string(), type: z.string() })),
  truncated: z.boolean(),
});

export function isUsefulPath(path: string): boolean {
  if (path.length === 0 || path.length > MAX_PATH_CHARS) return false;
  const segments = path.split("/");
  const fileName = (segments.at(-1) ?? "").toLowerCase();
  if (segments.slice(0, -1).some((dir) => IGNORED_DIRS.has(dir.toLowerCase()))) return false;
  if (IGNORED_FILES.has(fileName) || fileName.endsWith(".min.js")) return false;
  return !IGNORED_EXTENSIONS.test(fileName);
}

// Shallow paths first, so the cap keeps the overall structure of big repos.
function byDepthThenName(a: string, b: string): number {
  const depth = a.split("/").length - b.split("/").length;
  return depth !== 0 ? depth : a.localeCompare(b);
}

export async function fetchTree(ref: RepoRef): Promise<RepoTree> {
  // "HEAD" resolves to the default branch, which saves a metadata request.
  // 409 means the repository is empty.
  const json = await githubFetch(`${repoPath(ref, "git", "trees", "HEAD")}?recursive=1`, {
    nullOnStatus: [409],
  });
  if (json === null) return { paths: [], totalFiles: 0, truncated: false };

  const parsed = treeSchema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError("INTERNAL", {
      status: 502,
      safeMessage: "GitHub returned an unexpected response.",
      cause: parsed.error,
    });
  }

  const files = parsed.data.tree
    .filter((entry) => entry.type === "blob" && isUsefulPath(entry.path))
    .map((entry) => entry.path)
    .sort(byDepthThenName);

  return {
    paths: files.slice(0, MAX_TREE_PATHS),
    totalFiles: files.length,
    truncated: parsed.data.truncated || files.length > MAX_TREE_PATHS,
  };
}
