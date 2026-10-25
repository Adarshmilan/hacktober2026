/**
 * Tests for trim-content: budgets, word boundaries and section priority.
 * Depends on: vitest, @/lib/utils/trim-content.
 */
import { describe, expect, it } from "vitest";
import { TRUNCATION_MARKER, cutAtBoundary, trimContent } from "@/lib/utils/trim-content";

describe("cutAtBoundary", () => {
  it("never cuts in the middle of a word", () => {
    expect(cutAtBoundary("alpha beta gamma delta", 13)).toBe("alpha beta");
  });

  it("keeps a word that ends exactly at the budget", () => {
    expect(cutAtBoundary("alpha beta gamma", 10)).toBe("alpha beta");
  });

  it("prefers a line break near the end", () => {
    expect(cutAtBoundary("aaaa bbbb cccc dddd\neee fff", 23)).toBe("aaaa bbbb cccc dddd");
  });

  it("hard-cuts only when there is no whitespace at all", () => {
    expect(cutAtBoundary("abcdefghij", 4)).toBe("abcd");
  });
});

describe("trimContent", () => {
  it("returns short text unchanged", () => {
    expect(trimContent("hello world", 100)).toBe("hello world");
  });

  it("returns an empty string for a zero budget", () => {
    expect(trimContent("hello", 0)).toBe("");
  });

  it("never exceeds the budget and marks truncation", () => {
    const text = "word ".repeat(500);
    const result = trimContent(text, 200);
    expect(result.length).toBeLessThanOrEqual(200);
    expect(result.endsWith(TRUNCATION_MARKER)).toBe(true);
    expect(
      result
        .replace(TRUNCATION_MARKER, "")
        .trim()
        .split(" ")
        .every((w) => w === "word"),
    ).toBe(true);
  });

  it("keeps the intro and install section over less important ones", () => {
    const readme = [
      "# My Project",
      "A tool that does things.",
      "## License",
      "Lorem ipsum ".repeat(100),
      "## Installation",
      "Run npm install then npm run dev.",
    ].join("\n");

    const result = trimContent(readme, 150);
    expect(result.length).toBeLessThanOrEqual(150);
    expect(result).toContain("A tool that does things.");
    expect(result).toContain("npm install");
    // Sections stay in their original order.
    expect(result.indexOf("# My Project")).toBeLessThan(result.indexOf("## Installation"));
  });

  it("ignores heading-like lines inside code blocks", () => {
    const text = [
      "# Intro",
      "```bash",
      "# Installation comment",
      "```",
      "## Other",
      "x ".repeat(200),
    ].join("\n");
    const result = trimContent(text, 80);
    expect(result).toContain("# Installation comment");
    expect(result.length).toBeLessThanOrEqual(80);
  });
});
