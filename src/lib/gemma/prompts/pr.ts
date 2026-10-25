/**
 * System prompt for the pull request description helper.
 * Exports: prSystemPrompt().
 * Depends on: @/lib/gemma/prompts/shared, @/types.
 */
import { buildSystemPrompt } from "@/lib/gemma/prompts/shared";
import type { Language } from "@/types";

const JSON_SHAPE = `{
  "title": "concise pull request title (under 72 characters)",
  "description": "the pull request body in GitHub markdown",
  "changesList": ["one bullet per meaningful change"],
  "testingNotes": "how the change was or can be tested, or unknown",
  "checklist": ["checklist items the author should confirm"]
}`;

export function prSystemPrompt(language: Language): string {
  return buildSystemPrompt({
    task: "Write a clear pull request title and description for the diff or list of changed files below.",
    jsonShape: JSON_SHAPE,
    language,
    rules: [
      "Describe only changes that appear in the diff. Do not invent motivation, issue numbers or results.",
      "Never claim tests were run unless the diff adds or changes tests; otherwise suggest how to test.",
      "If a pull request template is provided, fill in its sections inside description, keeping its headings.",
      "If CONTRIBUTING rules mention a title format (such as Conventional Commits), follow it.",
      "Build the checklist from the template or contributing rules when provided, otherwise use sensible defaults.",
    ],
  });
}
