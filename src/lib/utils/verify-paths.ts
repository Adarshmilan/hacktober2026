/**
 * Checks file and folder paths cited by the model against the real repo.
 * Exports: createPathResolver().
 * Depends on: nothing.
 *
 * Models sometimes invent plausible paths. Anything that does not exist in the
 * fetched file list is treated as uncited, which keeps the
 * "every claim cites a real file" rule honest.
 */

/** Returns a function mapping a cited path to its real spelling, or null. */
export function createPathResolver(knownPaths: readonly string[]) {
  const entries = new Map<string, string>();

  for (const path of knownPaths) {
    entries.set(path.toLowerCase(), path);
    const segments = path.split("/");
    for (let depth = 1; depth < segments.length; depth += 1) {
      const folder = segments.slice(0, depth).join("/");
      if (!entries.has(folder.toLowerCase())) entries.set(folder.toLowerCase(), folder);
    }
  }

  return (candidate: string): string | null => {
    const normalized = candidate
      .trim()
      .replace(/^\.?\//, "")
      .replace(/\/+$/, "")
      .toLowerCase();
    return normalized.length > 0 ? (entries.get(normalized) ?? null) : null;
  };
}
