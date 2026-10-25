/**
 * Typed error carrying a stable error code and a message safe to show users.
 * Exports: ApiError, isApiError().
 * Depends on: @/types.
 *
 * The real cause (which may contain internal details) is kept in `cause` for
 * server logs and is never sent to the client.
 */
import type { ErrorCode } from "@/types";

const DEFAULTS: Record<ErrorCode, { status: number; message: string }> = {
  INVALID_INPUT: {
    status: 400,
    message: "The request is invalid. Check your input and try again.",
  },
  REPO_NOT_FOUND: { status: 404, message: "That repository was not found or is not public." },
  GITHUB_RATE_LIMIT: {
    status: 503,
    message: "GitHub's rate limit was reached. Please try again later.",
  },
  IMAGE_INVALID: {
    status: 400,
    message: "The image must be a PNG, JPEG or WebP file within the size limit.",
  },
  RATE_LIMITED: { status: 429, message: "Too many requests. Please wait a minute and try again." },
  MODEL_ERROR: {
    status: 502,
    message: "The AI model could not produce a valid answer. Please try again.",
  },
  INTERNAL: { status: 500, message: "Something went wrong on our side. Please try again." },
};

interface ApiErrorOptions {
  safeMessage?: string;
  status?: number;
  retryAfterSeconds?: number;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly safeMessage: string;
  readonly retryAfterSeconds: number | undefined;

  constructor(code: ErrorCode, options: ApiErrorOptions = {}) {
    const defaults = DEFAULTS[code];
    const safeMessage = options.safeMessage ?? defaults.message;
    super(safeMessage, { cause: options.cause });
    this.name = "ApiError";
    this.code = code;
    this.status = options.status ?? defaults.status;
    this.safeMessage = safeMessage;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
