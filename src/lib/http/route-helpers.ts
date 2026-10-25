/**
 * Shared wrapper and body parsers used by every API route.
 * Exports: withRoute(), parseJsonBody(), parseMultipartBody(), validationError().
 * Depends on: zod, @/lib/config/env, @/lib/http/api-error,
 *   @/lib/security/rate-limit, @/lib/utils/logger, @/schemas/requests.
 *
 * withRoute applies the rate limit, runs the handler, and turns any error into
 * a safe { ok: false, error } response. Error details go to server logs only.
 */
import type { z } from "zod";
import { getEnv } from "@/lib/config/env";
import { ApiError, isApiError } from "@/lib/http/api-error";
import { createRateLimiter, type RateLimiter } from "@/lib/security/rate-limit";
import { logger } from "@/lib/utils/logger";
import { REQUEST_LIMITS } from "@/schemas/requests";

const NO_STORE = { "Cache-Control": "no-store" };
const IP_SHAPE = /^[0-9a-fA-F:.]{2,45}$/;

let sharedLimiter: RateLimiter | undefined;

function getLimiter(): RateLimiter {
  sharedLimiter ??= createRateLimiter({ limit: getEnv().RATE_LIMIT_PER_MIN, windowMs: 60_000 });
  return sharedLimiter;
}

// Trusts proxy headers, which is correct behind Vercel or a similar proxy.
// Locally every request shares one "unknown" bucket.
function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwarded || request.headers.get("x-real-ip")?.trim() || "";
  return IP_SHAPE.test(candidate) ? candidate : "unknown";
}

function errorResponse(error: ApiError): Response {
  const headers: Record<string, string> = { ...NO_STORE };
  if (error.retryAfterSeconds !== undefined)
    headers["Retry-After"] = String(error.retryAfterSeconds);
  return Response.json(
    { ok: false, error: { code: error.code, message: error.safeMessage } },
    { status: error.status, headers },
  );
}

function describeCause(error: unknown): string {
  const cause = isApiError(error) ? error.cause : error;
  if (cause instanceof Error) return `${cause.name}: ${cause.message}`;
  return cause === undefined ? "" : "non-error thrown";
}

export function withRoute<T>(route: string, handler: (request: Request) => Promise<T>) {
  return async (request: Request): Promise<Response> => {
    const startedAt = Date.now();
    try {
      const limit = getLimiter().check(getClientIp(request));
      if (!limit.allowed) {
        throw new ApiError("RATE_LIMITED", { retryAfterSeconds: limit.retryAfterSeconds });
      }

      const data = await handler(request);
      logger.info({ event: "request_ok", route, status: 200, durationMs: Date.now() - startedAt });
      return Response.json({ ok: true, data }, { headers: NO_STORE });
    } catch (error) {
      const apiError = isApiError(error) ? error : new ApiError("INTERNAL", { cause: error });
      const log = apiError.status >= 500 ? logger.error : logger.warn;
      log({
        event: "request_failed",
        route,
        status: apiError.status,
        code: apiError.code,
        durationMs: Date.now() - startedAt,
        detail: describeCause(apiError),
      });
      return errorResponse(apiError);
    }
  };
}

const tooLarge = () =>
  new ApiError("INVALID_INPUT", { safeMessage: "The request is too large.", status: 413 });

/** Reads the body but stops as soon as it exceeds maxBytes, whatever headers claim. */
async function readBodyWithLimit(
  request: Request,
  maxBytes: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) throw tooLarge();
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw tooLarge();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export function validationError(error: z.ZodError): ApiError {
  const issue = error.issues[0];
  const field = issue?.path.join(".");
  const safeMessage = issue ? `${field ? `${field}: ` : ""}${issue.message}` : undefined;
  return new ApiError(
    "INVALID_INPUT",
    safeMessage ? { safeMessage, cause: error } : { cause: error },
  );
}

export async function parseJsonBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<z.infer<S>> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new ApiError("INVALID_INPUT", { safeMessage: "Send the request as JSON.", status: 415 });
  }

  const bytes = await readBodyWithLimit(request, REQUEST_LIMITS.maxJsonBodyBytes);
  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder().decode(bytes));
  } catch (error) {
    throw new ApiError("INVALID_INPUT", {
      safeMessage: "The request body is not valid JSON.",
      cause: error,
    });
  }

  const result = schema.safeParse(json);
  if (!result.success) throw validationError(result.error);
  return result.data;
}

/** Parses multipart form data from a size-capped, in-memory copy of the body. */
export async function parseMultipartBody(request: Request, maxBytes: number): Promise<FormData> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    throw new ApiError("INVALID_INPUT", {
      safeMessage: "Send the request as form data.",
      status: 415,
    });
  }

  const bytes = await readBodyWithLimit(request, maxBytes);
  try {
    return await new Response(bytes, { headers: { "content-type": contentType } }).formData();
  } catch (error) {
    throw new ApiError("INVALID_INPUT", {
      safeMessage: "The form data could not be read.",
      cause: error,
    });
  }
}
