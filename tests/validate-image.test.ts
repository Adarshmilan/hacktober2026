/**
 * Tests for validate-image: allowed types, bad types, oversized files and
 * files whose extension or declared type lies about their content.
 * Depends on: vitest, @/lib/security/validate-image, @/lib/http/api-error.
 */
import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/http/api-error";
import { detectImageType, validateImage } from "@/lib/security/validate-image";

const MB = 1024 * 1024;

const png = () => new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const jpeg = () => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
const webp = () => new TextEncoder().encode("RIFF\u0000\u0000\u0000\u0000WEBPVP8 ");
const gif = () => new TextEncoder().encode("GIF89a......");

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
  } catch (error) {
    return error instanceof ApiError ? error.code : "NOT_API_ERROR";
  }
  return undefined;
}

describe("detectImageType", () => {
  it("recognizes PNG, JPEG and WebP signatures", () => {
    expect(detectImageType(png())).toBe("image/png");
    expect(detectImageType(jpeg())).toBe("image/jpeg");
    expect(detectImageType(webp())).toBe("image/webp");
  });

  it("returns null for other formats", () => {
    expect(detectImageType(gif())).toBeNull();
    expect(detectImageType(new TextEncoder().encode("RIFF....WAVE"))).toBeNull();
  });
});

describe("validateImage", () => {
  it("accepts a valid PNG and returns base64 with the detected type", () => {
    const result = validateImage(png(), 4 * MB, "image/png");
    expect(result.mimeType).toBe("image/png");
    expect(Buffer.from(result.base64, "base64")).toEqual(Buffer.from(png()));
  });

  it("uses the real signature when the declared type is missing", () => {
    expect(validateImage(jpeg(), 4 * MB, "").mimeType).toBe("image/jpeg");
    expect(validateImage(webp(), 4 * MB, "application/octet-stream").mimeType).toBe("image/webp");
  });

  it("rejects disallowed formats", () => {
    expect(codeOf(() => validateImage(gif(), 4 * MB, "image/gif"))).toBe("IMAGE_INVALID");
    expect(codeOf(() => validateImage(gif(), 4 * MB))).toBe("IMAGE_INVALID");
  });

  it("rejects a disallowed declared type even if the bytes are a PNG", () => {
    expect(codeOf(() => validateImage(png(), 4 * MB, "image/svg+xml"))).toBe("IMAGE_INVALID");
  });

  it("rejects a fake .png that is really HTML or a script", () => {
    const fake = new TextEncoder().encode("<script>alert(1)</script>");
    expect(codeOf(() => validateImage(fake, 4 * MB, "image/png"))).toBe("IMAGE_INVALID");
  });

  it("rejects oversized files with status 413", () => {
    const big = new Uint8Array(4 * MB + 1);
    big.set(png());
    try {
      validateImage(big, 4 * MB, "image/png");
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(413);
      expect((error as ApiError).safeMessage).toContain("4 MB");
    }
  });

  it("rejects empty and truncated files", () => {
    expect(codeOf(() => validateImage(new Uint8Array(), 4 * MB))).toBe("IMAGE_INVALID");
    expect(codeOf(() => validateImage(new Uint8Array([0x89, 0x50]), 4 * MB))).toBe("IMAGE_INVALID");
  });
});
