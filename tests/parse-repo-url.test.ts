/**
 * Tests for parse-repo-url: accepted formats and malicious or SSRF-style input.
 * Depends on: vitest, @/lib/github/parse-repo-url, @/lib/http/api-error.
 */
import { describe, expect, it } from "vitest";
import { parseRepoUrl } from "@/lib/github/parse-repo-url";
import { ApiError } from "@/lib/http/api-error";

describe("parseRepoUrl: valid input", () => {
  it.each([
    ["vercel/next.js", "vercel", "next.js"],
    ["  octo-org/my_repo  ", "octo-org", "my_repo"],
    ["https://github.com/vercel/next.js", "vercel", "next.js"],
    ["http://github.com/a/b", "a", "b"],
    ["github.com/a/b", "a", "b"],
    ["www.github.com/a/b", "a", "b"],
    ["https://GitHub.com/A/B", "A", "B"],
    ["https://github.com/a/b.git", "a", "b"],
    ["https://github.com/a/b/", "a", "b"],
    ["a/b///", "a", "b"],
    ["https://github.com/a/b/tree/main/src", "a", "b"],
    ["https://github.com/a/b/issues?q=is:open", "a", "b"],
    ["https://github.com/a/b#readme", "a", "b"],
  ])("parses %s", (input, owner, repo) => {
    expect(parseRepoUrl(input)).toEqual({ owner, repo });
  });
});

describe("parseRepoUrl: rejected input", () => {
  it.each([
    "",
    "   ",
    "just-a-name",
    "a/b/c",
    "a/",
    "/b",
    "https://github.com/onlyowner",
    "https://evil.com/a/b",
    "https://github.com.evil.com/a/b",
    "https://evil.com/github.com/a/b",
    "https://evilgithub.com/a/b",
    "https://gist.github.com/a/b",
    "https://api.github.com/repos/a/b",
    "https://user:pass@github.com/a/b",
    "https://github.com@evil.com/a/b",
    "https://github.com:8080/a/b",
    "https://github.com\\@evil.com/a/b",
    "javascript:alert(1)",
    "file:///etc/passwd",
    "ftp://github.com/a/b",
    "http://169.254.169.254/latest/meta-data",
    "http://localhost/a/b",
    "https://github.com/../../etc/passwd",
    "a/..",
    "https://github.com/a/..",
    "https://github.com/a/%2e%2e",
    "a/b\nc",
    "a /b",
    "-bad/repo",
    "bad-/repo",
    "a/b$",
    "a/<script>",
    "https://gіthub.com/a/b", // Cyrillic "і"
    `a/${"x".repeat(101)}`,
    `${"x".repeat(40)}/repo`,
    `https://github.com/a/${"b".repeat(300)}`,
  ])("rejects %j", (input) => {
    expect(() => parseRepoUrl(input)).toThrow(ApiError);
  });

  it("uses the INVALID_INPUT code with a safe message", () => {
    try {
      parseRepoUrl("https://evil.com/a/b");
      expect.unreachable("should have thrown");
    } catch (error) {
      expect((error as ApiError).code).toBe("INVALID_INPUT");
      expect((error as ApiError).safeMessage).not.toContain("evil.com");
    }
  });
});
