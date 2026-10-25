/**
 * Zod schemas for model output and API responses.
 * Exports: errorCodeSchema, explainResultSchema, issueRankingModelSchema,
 *   issuesDataSchema, bugReportResultSchema, prResultSchema, modelsDataSchema,
 *   apiErrorBodySchema,
 *   apiSuccessSchema().
 * Depends on: zod.
 *
 * Every string and array has an upper bound so a misbehaving model cannot
 * return huge payloads to the browser.
 */
import { z } from "zod";

export const errorCodeSchema = z.enum([
  "INVALID_INPUT",
  "REPO_NOT_FOUND",
  "GITHUB_RATE_LIMIT",
  "IMAGE_INVALID",
  "RATE_LIMITED",
  "MODEL_ERROR",
  "INTERNAL",
]);

const shortText = z.string().trim().min(1).max(300);
const longText = z.string().trim().min(1).max(4_000);
const filePath = z.string().trim().min(1).max(300);
const list = <T extends z.ZodType>(item: T, max = 20) => z.array(item).max(max);

// "source" is a repo file path, or "unknown" when the model cannot cite one.
const sourceField = filePath;

export const explainResultSchema = z.object({
  summary: longText,
  techStack: list(z.object({ name: shortText, source: sourceField })),
  howToRunLocally: list(z.object({ step: longText, source: sourceField })),
  folders: list(z.object({ path: filePath, purpose: shortText }), 30),
  whereToStart: list(z.object({ path: filePath, reason: shortText }), 10),
  sources: list(filePath, 30),
});

// What the model returns. Titles and URLs are added from GitHub data so the
// model cannot invent them.
export const issueRankingModelSchema = z.object({
  issues: list(
    z.object({
      number: z.number().int().positive(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      whyBeginnerFriendly: longText,
      likelyFiles: list(filePath, 10),
      suggestedFirstStep: longText,
      confidence: z.number().min(0).max(1),
    }),
    30,
  ),
});

export const issuesDataSchema = z.object({
  issues: list(
    issueRankingModelSchema.shape.issues.element.extend({
      title: z.string().max(500),
      url: z.string().max(500),
    }),
    30,
  ),
});

export const bugReportResultSchema = z.object({
  title: shortText,
  summary: longText,
  stepsToReproduce: list(longText),
  expected: longText,
  actual: longText,
  environment: longText,
  possibleCause: longText,
  labels: list(z.string().trim().min(1).max(50), 10),
  missingInfoQuestions: list(shortText, 10),
});

export const prResultSchema = z.object({
  title: shortText,
  description: z.string().trim().min(1).max(8_000),
  changesList: list(longText, 30),
  testingNotes: longText,
  checklist: list(shortText),
});

export const modelsDataSchema = z.object({
  models: z.array(z.object({ id: z.string(), displayName: z.string() })).max(50),
  defaultModel: z.string(),
});

export const apiErrorBodySchema = z.object({
  ok: z.literal(false),
  error: z.object({ code: errorCodeSchema, message: z.string() }),
});

export const apiSuccessSchema = <T extends z.ZodType>(data: T) =>
  z.object({ ok: z.literal(true), data });
