/**
 * System prompt for the good-first-issue finder.
 * Exports: issuesSystemPrompt().
 * Depends on: @/lib/gemma/prompts/shared, @/types.
 */
import { CITE_SOURCES_RULE, buildSystemPrompt } from "@/lib/gemma/prompts/shared";
import type { Language } from "@/types";

const JSON_SHAPE = `{
  "issues": [{
    "number": 123,
    "difficulty": "easy" | "medium" | "hard",
    "whyBeginnerFriendly": "why a newcomer could handle it, or what makes it hard",
    "likelyFiles": ["file paths from the file tree that probably need changes"],
    "suggestedFirstStep": "one concrete first action",
    "confidence": 0.0 to 1.0
  }]
}`;

export function issuesSystemPrompt(language: Language): string {
  return buildSystemPrompt({
    task: "Rank the open issues below by how suitable they are for a first-time contributor, easiest first, and explain each one.",
    jsonShape: JSON_SHAPE,
    language,
    rules: [
      CITE_SOURCES_RULE,
      "Only use issue numbers that appear in the data. Include every issue you were given.",
      "likelyFiles must come from the file tree. Use an empty list if you cannot tell.",
      "Base difficulty on the issue text and labels, not on guesses about the code.",
      "confidence is how sure you are about the difficulty rating.",
    ],
  });
}
