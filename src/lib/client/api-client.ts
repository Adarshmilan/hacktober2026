/**
 * Browser-side helpers for calling this app's API routes.
 * Exports: getJson(), postJson(), postForm().
 * Depends on: @/types.
 *
 * Always resolves to the { ok, data | error } envelope, so components never
 * have to handle thrown network errors themselves.
 */
import type { ApiResponse } from "@/types";

const failure = (message: string): ApiResponse<never> => ({
  ok: false,
  error: { code: "INTERNAL", message },
});

async function send<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    return failure("Could not reach the server. Check your connection and try again.");
  }

  try {
    const body = (await response.json()) as unknown;
    if (body && typeof body === "object" && "ok" in body) return body as ApiResponse<T>;
  } catch {
    // Fall through to the generic message below.
  }
  return failure("The server sent an unexpected response. Please try again.");
}

export const getJson = <T>(path: string) => send<T>(path);

export const postJson = <T>(path: string, body: unknown) =>
  send<T>(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

export const postForm = <T>(path: string, form: FormData) =>
  send<T>(path, { method: "POST", body: form });
