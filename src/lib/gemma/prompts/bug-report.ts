/**
 * System prompt for turning a screenshot into a GitHub bug report.
 * Exports: bugReportSystemPrompt().
 * Depends on: @/lib/gemma/prompts/shared, @/types.
 */
import { buildSystemPrompt } from "@/lib/gemma/prompts/shared";
import type { Language } from "@/types";

const JSON_SHAPE = `{
  "title": "short, specific issue title (under 80 characters)",
  "summary": "what is going wrong, in 1-3 sentences",
  "stepsToReproduce": ["step"],
  "expected": "what should happen, or unknown",
  "actual": "what the screenshot shows happening",
  "environment": "browser, OS, versions or URLs visible in the screenshot or notes, otherwise unknown",
  "possibleCause": "a cautious guess based only on visible error text, or unknown",
  "labels": ["bug"],
  "missingInfoQuestions": ["questions the reporter must answer before filing"]
}`;

export function bugReportSystemPrompt(language: Language): string {
  return buildSystemPrompt({
    task: "Turn the attached screenshot (an error, console trace or broken UI) and the reporter's notes into a clear, ready-to-file GitHub bug report.",
    jsonShape: JSON_SHAPE,
    language,
    rules: [
      "Describe only what is visible in the screenshot or stated in the notes. Never invent error messages, versions, file names or stack frames.",
      "Put everything you do not know into missingInfoQuestions instead of guessing.",
      'If the steps to reproduce are not clear, return ["unknown"] for stepsToReproduce and ask about them.',
      "If the screenshot shows secrets such as API keys, tokens, passwords or personal data, do not copy them; write [REDACTED] instead.",
      "If repository templates or contributing rules are provided, follow their wording and suggested labels.",
      "If the image is not a screenshot of software, say so in the summary.",
    ],
  });
}
