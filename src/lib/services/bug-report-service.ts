/**
 * Screenshot to bug report: validates the image, optionally loads the repo's
 * contributing rules and issue templates, and asks Gemma for a report.
 * Exports: createBugReport().
 * Depends on: server-only, @/lib/config/env, @/lib/github/*, @/lib/gemma/*,
 *   @/lib/security/validate-image, @/schemas/responses, @/types.
 */
import "server-only";
import { getEnv } from "@/lib/config/env";
import { generateJson } from "@/lib/gemma/generate-json";
import { resolveModel } from "@/lib/gemma/list-models";
import { bugReportSystemPrompt } from "@/lib/gemma/prompts/bug-report";
import { wrapUntrusted } from "@/lib/gemma/prompts/shared";
import { fetchContributing } from "@/lib/github/fetch-contributing";
import { fetchTree } from "@/lib/github/fetch-tree";
import { parseRepoUrl } from "@/lib/github/parse-repo-url";
import { validateImage } from "@/lib/security/validate-image";
import { bugReportResultSchema } from "@/schemas/responses";
import type { BugReportFields, BugReportResult, RepoFile } from "@/types";

const BUDGET = { notes: 2_000, contributing: 3_000, template: 2_000 } as const;

interface BugReportInput {
  fields: BugReportFields;
  imageBytes: Uint8Array;
  declaredMimeType: string;
}

const fileBlock = (label: string, file: RepoFile, maxChars: number) =>
  wrapUntrusted(label, `path: ${file.path}\n\n${file.text}`, maxChars);

async function repoContext(repoUrl: string): Promise<string[]> {
  const ref = parseRepoUrl(repoUrl);
  const tree = await fetchTree(ref);
  const docs = await fetchContributing(ref, tree.paths);
  const blocks = [`Repository: ${ref.owner}/${ref.repo}`];
  if (docs?.contributing) {
    blocks.push(fileBlock("contributing", docs.contributing, BUDGET.contributing));
  }
  docs?.issueTemplates.forEach((template, index) =>
    blocks.push(fileBlock(`issue_template_${index + 1}`, template, BUDGET.template)),
  );
  return blocks;
}

export async function createBugReport(input: BugReportInput): Promise<BugReportResult> {
  const maxBytes = getEnv().MAX_IMAGE_MB * 1024 * 1024;
  // Validate before any network call so bad uploads fail fast and cheaply.
  const image = validateImage(input.imageBytes, maxBytes, input.declaredMimeType);
  const { fields } = input;
  const model = await resolveModel(fields.model);

  const blocks = ["The screenshot is attached as an image."];
  blocks.push(
    fields.notes
      ? wrapUntrusted("reporter_notes", fields.notes, BUDGET.notes)
      : "The reporter gave no notes.",
  );
  if (fields.repoUrl) blocks.push(...(await repoContext(fields.repoUrl)));

  return generateJson({
    model,
    systemPrompt: bugReportSystemPrompt(fields.language),
    userContent: blocks.join("\n\n"),
    schema: bugReportResultSchema,
    image,
    maxOutputTokens: 2_000,
  });
}
