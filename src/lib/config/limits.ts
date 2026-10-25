/**
 * Input size limits shared by server validation and the browser UI.
 * Exports: REQUEST_LIMITS.
 * Depends on: nothing (safe to import in client code; contains no secrets).
 */
export const REQUEST_LIMITS = {
  maxJsonBodyBytes: 100_000,
  maxRepoUrlChars: 200,
  maxDiffChars: 60_000,
  maxNotesChars: 2_000,
  // Multipart bodies carry the image plus a few small text fields.
  multipartOverheadBytes: 64_000,
} as const;
