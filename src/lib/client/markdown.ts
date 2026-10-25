/**
 * Turns results into markdown for copying, and builds the prefilled
 * "new issue" link for GitHub.
 * Exports: explainToMarkdown(), issuesToMarkdown(), bugReportToMarkdown(),
 *   prToMarkdown(), newIssueUrl().
 * Depends on: @/types.
 */
import type { BugReportResult, ExplainResult, IssuesData, PrResult, RepoRef } from "@/types";

// Browsers and GitHub reject very long URLs; stay well under common limits.
const MAX_ISSUE_URL_CHARS = 8_000;
const SHORTENED_NOTE = "\n\n_(Shortened to fit in the link. Copy the full report from the app.)_";

const bullets = (items: readonly string[]) =>
  items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- unknown";
const numbered = (items: readonly string[]) =>
  items.length > 0 ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : "1. unknown";
const cite = (source: string) => (source === "unknown" ? "(no source)" : `(\`${source}\`)`);

export function explainToMarkdown(result: ExplainResult): string {
  return [
    `## Summary\n${result.summary}`,
    `## Tech stack\n${bullets(result.techStack.map((t) => `${t.name} ${cite(t.source)}`))}`,
    `## How to run locally\n${numbered(result.howToRunLocally.map((s) => `${s.step} ${cite(s.source)}`))}`,
    `## Folders\n${bullets(result.folders.map((f) => `\`${f.path}\`: ${f.purpose}`))}`,
    `## Where to start\n${bullets(result.whereToStart.map((w) => `\`${w.path}\`: ${w.reason}`))}`,
    `## Sources\n${bullets(result.sources.map((s) => `\`${s}\``))}`,
  ].join("\n\n");
}

export function issuesToMarkdown(data: IssuesData): string {
  return data.issues
    .map(
      (issue) =>
        `### [#${issue.number} ${issue.title}](${issue.url})\n` +
        `**Difficulty:** ${issue.difficulty} (confidence ${Math.round(issue.confidence * 100)}%)\n\n` +
        `${issue.whyBeginnerFriendly}\n\n**First step:** ${issue.suggestedFirstStep}` +
        (issue.likelyFiles.length > 0
          ? `\n\n**Likely files:** ${issue.likelyFiles.map((f) => `\`${f}\``).join(", ")}`
          : ""),
    )
    .join("\n\n");
}

export function bugReportToMarkdown(report: BugReportResult): string {
  return [
    `## Summary\n${report.summary}`,
    `## Steps to reproduce\n${numbered(report.stepsToReproduce)}`,
    `## Expected behavior\n${report.expected}`,
    `## Actual behavior\n${report.actual}`,
    `## Environment\n${report.environment}`,
    `## Possible cause\n${report.possibleCause}`,
    report.missingInfoQuestions.length > 0
      ? `## Open questions\n${bullets(report.missingInfoQuestions)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function prToMarkdown(result: PrResult): string {
  return [
    result.description,
    `## Changes\n${bullets(result.changesList)}`,
    `## Testing\n${result.testingNotes}`,
    `## Checklist\n${result.checklist.map((item) => `- [ ] ${item}`).join("\n")}`,
  ].join("\n\n");
}

/** Opens GitHub's own "new issue" form, prefilled. Nothing is submitted. */
export function newIssueUrl(ref: RepoRef, title: string, body: string): string {
  const base = `https://github.com/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}/issues/new`;
  const build = (text: string) =>
    `${base}?${new URLSearchParams({ title, body: text }).toString()}`;

  let text = body;
  let url = build(text);
  // Non-Latin scripts grow a lot when URL-encoded, so shrink until it fits.
  while (url.length > MAX_ISSUE_URL_CHARS && text.length > 0) {
    text = text.slice(0, Math.floor(text.length * 0.8));
    url = build(text + SHORTENED_NOTE);
  }
  return url;
}
