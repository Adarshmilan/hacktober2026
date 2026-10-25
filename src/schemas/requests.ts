/**
 * Zod schemas and size limits for every API request.
 * Exports: REQUEST_LIMITS, languageSchema, allowedImageMimeTypeSchema,
 *   explainRequestSchema, issuesRequestSchema, prRequestSchema, bugReportFieldsSchema.
 * Depends on: zod, @/lib/config/limits.
 *
 * Repo URLs are only length-checked here. Strict owner/repo parsing happens in
 * lib/github/parse-repo-url so there is one source of truth for that rule.
 */
import { z } from "zod";
import { REQUEST_LIMITS } from "@/lib/config/limits";

export { REQUEST_LIMITS };

export const languageSchema = z.enum(["en", "hi", "gu"]);

export const allowedImageMimeTypeSchema = z.enum(["image/png", "image/jpeg", "image/webp"]);

// Form fields arrive as "" when left empty; treat that as "not provided".
const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const repoUrlField = z
  .string()
  .trim()
  .min(1, "Enter a repository.")
  .max(REQUEST_LIMITS.maxRepoUrlChars);

const optionalRepoUrlField = z.preprocess(blankToUndefined, repoUrlField.optional());

// Shape check only. The server also checks the name against the live model list.
const modelField = z.preprocess(
  blankToUndefined,
  z
    .string()
    .trim()
    .regex(/^gemma-[a-z0-9.-]{1,60}$/, "Unknown model.")
    .optional(),
);

const languageField = z.preprocess(blankToUndefined, languageSchema.default("en"));

export const explainRequestSchema = z.strictObject({
  repoUrl: repoUrlField,
  language: languageField,
  model: modelField,
});

export const issuesRequestSchema = z.strictObject({
  repoUrl: repoUrlField,
  language: languageField,
  model: modelField,
});

export const prRequestSchema = z.strictObject({
  diff: z
    .string()
    .trim()
    .min(1, "Paste a diff or a list of changed files.")
    .max(REQUEST_LIMITS.maxDiffChars, "The diff is too long. Paste a smaller part of it."),
  repoUrl: optionalRepoUrlField,
  language: languageField,
  model: modelField,
});

// The image itself is validated separately by lib/security/validate-image.
export const bugReportFieldsSchema = z.strictObject({
  notes: z.preprocess(
    blankToUndefined,
    z.string().trim().max(REQUEST_LIMITS.maxNotesChars, "Notes are too long.").optional(),
  ),
  repoUrl: optionalRepoUrlField,
  language: languageField,
  model: modelField,
});
