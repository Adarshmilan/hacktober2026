/**
 * System prompt for the repo explainer.
 * Exports: explainSystemPrompt().
 * Depends on: @/lib/gemma/prompts/shared, @/types.
 */
import { CITE_SOURCES_RULE, buildSystemPrompt } from "@/lib/gemma/prompts/shared";
import type { Language } from "@/types";

const JSON_SHAPE = `{
  "summary": "2-4 sentences: what the project does and who it is for",
  "techStack": [{ "name": "language, framework or tool", "source": "file path that shows it, or unknown" }],
  "howToRunLocally": [{ "step": "one step, with the exact command if documented", "source": "file path, or unknown" }],
  "folders": [{ "path": "folder path from the file tree", "purpose": "what it contains" }],
  "whereToStart": [{ "path": "file or folder path from the file tree", "reason": "why a newcomer should look here" }],
  "sources": ["every file path you used"]
}`;

export function explainSystemPrompt(language: Language): string {
  return buildSystemPrompt({
    task: "Explain how this GitHub repository is organized and how to run it locally, for a beginner who wants to make a first contribution.",
    jsonShape: JSON_SHAPE,
    language,
    rules: [
      CITE_SOURCES_RULE,
      "Only list folders and files that appear in the file tree.",
      "List at most 8 folders, the most important first, and at most 5 places to start.",
      'If the run steps are not documented, return a single step saying so, with source "unknown".',
    ],
  });
}
