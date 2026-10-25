/**
 * Cleans untrusted text (READMEs, issues, diffs, notes) and wraps it in
 * delimiters the content itself cannot fake.
 * Exports: cleanUntrustedText(), wrapUntrusted(), UNTRUSTED_OPEN, UNTRUSTED_CLOSE.
 * Depends on: @/lib/utils/trim-content.
 *
 * Spoofing defense: after Unicode normalization (which turns lookalikes such
 * as fullwidth "＜" into "<") and removal of invisible characters, every run of
 * three or more "<" or ">" is broken up. The delimiters need "<<<" and ">>>",
 * so untrusted text can never contain a working delimiter.
 */
import { trimContent } from "@/lib/utils/trim-content";

export const UNTRUSTED_OPEN = "<<<UNTRUSTED_DATA";
export const UNTRUSTED_CLOSE = "<<<END_UNTRUSTED_DATA";

// C0/C1 control characters (except tab and newline), bidi overrides and
// isolates, and invisible formatting characters. ZWNJ/ZWJ (U+200C/U+200D) are
// kept because Hindi and Gujarati text needs them.
const UNSAFE_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B\u200E\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;

const DELIMITER_RUN = /<{3,}|>{3,}/g;
const LABEL_PATTERN = /^[a-z0-9_-]{1,40}$/;

export function cleanUntrustedText(text: string, maxChars: number): string {
  const normalized = text.normalize("NFKC").replace(/\r\n?/g, "\n").replace(UNSAFE_CHARS, "");
  const neutralized = normalized.replace(DELIMITER_RUN, (run) => run.split("").join(" "));
  return trimContent(neutralized, maxChars);
}

/** Labels are chosen by our code, never by users, but are still checked. */
export function wrapUntrusted(label: string, text: string, maxChars: number): string {
  if (!LABEL_PATTERN.test(label)) throw new Error("Invalid untrusted-content label.");
  const body = cleanUntrustedText(text, maxChars);
  return `${UNTRUSTED_OPEN} name="${label}">>>\n${body}\n${UNTRUSTED_CLOSE} name="${label}">>>`;
}
