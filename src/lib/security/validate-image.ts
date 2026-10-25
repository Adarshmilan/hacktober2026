/**
 * Validates an uploaded image in memory by size and real file signature.
 * Exports: detectImageType(), validateImage().
 * Depends on: @/lib/http/api-error, @/schemas/requests, @/types.
 *
 * The browser-declared MIME type and file extension are attacker-controlled,
 * so the decision is made from the file's magic bytes. Nothing touches disk.
 */
import { ApiError } from "@/lib/http/api-error";
import { allowedImageMimeTypeSchema } from "@/schemas/requests";
import type { AllowedImageMimeType, ValidatedImage } from "@/types";

const ascii = (text: string): number[] => Array.from(text, (char) => char.charCodeAt(0));

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

const SIGNATURES: ReadonlyArray<{
  mimeType: AllowedImageMimeType;
  matches: (bytes: Uint8Array) => boolean;
}> = [
  {
    mimeType: "image/png",
    matches: (bytes) => startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  { mimeType: "image/jpeg", matches: (bytes) => startsWith(bytes, [0xff, 0xd8, 0xff]) },
  {
    mimeType: "image/webp",
    matches: (bytes) => startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8),
  },
];

// Some browsers send these when they cannot tell the type; magic bytes decide.
const UNKNOWN_DECLARED_TYPES = new Set(["", "application/octet-stream"]);

export function detectImageType(bytes: Uint8Array): AllowedImageMimeType | null {
  return SIGNATURES.find((signature) => signature.matches(bytes))?.mimeType ?? null;
}

const invalid = (safeMessage: string, status?: number) =>
  new ApiError("IMAGE_INVALID", status === undefined ? { safeMessage } : { safeMessage, status });

export function validateImage(
  bytes: Uint8Array,
  maxBytes: number,
  declaredMimeType?: string,
): ValidatedImage {
  if (bytes.byteLength === 0) throw invalid("The image file is empty.");

  if (bytes.byteLength > maxBytes) {
    const limitMb = Math.round((maxBytes / (1024 * 1024)) * 10) / 10;
    throw invalid(`The image is larger than ${limitMb} MB.`, 413);
  }

  const declared = declaredMimeType?.trim().toLowerCase() ?? "";
  if (
    !UNKNOWN_DECLARED_TYPES.has(declared) &&
    !allowedImageMimeTypeSchema.safeParse(declared).success
  ) {
    throw invalid("Only PNG, JPEG and WebP images are allowed.");
  }

  const mimeType = detectImageType(bytes);
  if (!mimeType) throw invalid("The file is not a valid PNG, JPEG or WebP image.");

  return {
    mimeType,
    base64: Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64"),
  };
}
