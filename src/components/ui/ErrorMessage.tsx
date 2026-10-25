/**
 * Friendly error box for every API error code.
 * Exports: ErrorMessage.
 * Depends on: @/types.
 */
import type { ApiFailure, ErrorCode } from "@/types";

const DETAILS: Record<ErrorCode, { title: string; hint: string }> = {
  INVALID_INPUT: {
    title: "Please check your input",
    hint: "Fix the field mentioned above and try again.",
  },
  REPO_NOT_FOUND: {
    title: "Repository not found",
    hint: "Make sure the repository exists, is public and is spelled correctly.",
  },
  GITHUB_RATE_LIMIT: {
    title: "GitHub limit reached",
    hint: "Try again later. Whoever runs this app can set GITHUB_TOKEN to raise the limit.",
  },
  IMAGE_INVALID: { title: "Image not accepted", hint: "Use a PNG, JPEG or WebP screenshot." },
  RATE_LIMITED: { title: "Too many requests", hint: "Wait about a minute, then try again." },
  MODEL_ERROR: {
    title: "The AI could not answer",
    hint: "Try again, or pick a different model at the top of the page.",
  },
  INTERNAL: { title: "Something went wrong", hint: "Please try again in a moment." },
};

export function ErrorMessage({ error }: { error: ApiFailure["error"] }) {
  const details = DETAILS[error.code] ?? DETAILS.INTERNAL;
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
    >
      <p className="font-semibold">{details.title}</p>
      <p className="mt-1">{error.message}</p>
      <p className="mt-1 opacity-80">{details.hint}</p>
    </div>
  );
}
