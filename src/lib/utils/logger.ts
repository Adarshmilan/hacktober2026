/**
 * Minimal structured JSON logger that refuses to log secrets.
 * Exports: logger (info/warn/error), redactSecrets().
 * Depends on: @/types.
 *
 * Only the fixed LogEvent fields can be logged, so prompts, user text and
 * images cannot end up in logs by accident. The free-text `detail` field is
 * scrubbed for anything that looks like a credential and length-capped.
 */
import type { LogEvent } from "@/types";

type LogLevel = "info" | "warn" | "error";

const MAX_DETAIL_CHARS = 300;

const SECRET_PATTERNS: readonly RegExp[] = [
  /AIza[0-9A-Za-z_-]{20,}/g, // Google API keys
  /gh[pousr]_[A-Za-z0-9]{20,}/g, // GitHub classic tokens
  /github_pat_[A-Za-z0-9_]{20,}/g, // GitHub fine-grained tokens
  /Bearer\s+[^\s"']+/gi,
  /([?&](?:key|token|access_token)=)[^&\s"']+/gi,
];

export function redactSecrets(text: string): string {
  return SECRET_PATTERNS.reduce(
    (result, pattern) =>
      result.replace(pattern, (match, prefix?: unknown) =>
        typeof prefix === "string" && match.startsWith(prefix)
          ? `${prefix}[REDACTED]`
          : "[REDACTED]",
      ),
    text,
  );
}

function buildRecord(level: LogLevel, entry: LogEvent): Record<string, string | number> {
  const record: Record<string, string | number> = {
    ts: new Date().toISOString(),
    level,
    event: redactSecrets(entry.event),
  };
  if (entry.route !== undefined) record.route = entry.route;
  if (entry.status !== undefined) record.status = entry.status;
  if (entry.code !== undefined) record.code = entry.code;
  if (entry.durationMs !== undefined) record.durationMs = Math.round(entry.durationMs);
  if (entry.detail !== undefined) {
    record.detail = redactSecrets(entry.detail).slice(0, MAX_DETAIL_CHARS);
  }
  return record;
}

function write(level: LogLevel, entry: LogEvent): void {
  console[level](JSON.stringify(buildRecord(level, entry)));
}

export const logger = {
  info: (entry: LogEvent) => write("info", entry),
  warn: (entry: LogEvent) => write("warn", entry),
  error: (entry: LogEvent) => write("error", entry),
};
