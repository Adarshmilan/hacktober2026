/**
 * Shared TypeScript types, mostly inferred from the Zod schemas.
 * Exports: request, result, error and utility types used across the app.
 * Depends on: zod (types), @/schemas/requests, @/schemas/responses.
 */
import type { z } from "zod";
import type {
  allowedImageMimeTypeSchema,
  bugReportFieldsSchema,
  explainRequestSchema,
  issuesRequestSchema,
  languageSchema,
  prRequestSchema,
} from "@/schemas/requests";
import type {
  bugReportResultSchema,
  errorCodeSchema,
  explainResultSchema,
  issueRankingModelSchema,
  issuesDataSchema,
  modelsDataSchema,
  prResultSchema,
} from "@/schemas/responses";

export type Language = z.infer<typeof languageSchema>;
export type AllowedImageMimeType = z.infer<typeof allowedImageMimeTypeSchema>;
export type ErrorCode = z.infer<typeof errorCodeSchema>;

export type ExplainRequest = z.infer<typeof explainRequestSchema>;
export type IssuesRequest = z.infer<typeof issuesRequestSchema>;
export type PrRequest = z.infer<typeof prRequestSchema>;
export type BugReportFields = z.infer<typeof bugReportFieldsSchema>;

export type ExplainResult = z.infer<typeof explainResultSchema>;
export type IssueRankingModelOutput = z.infer<typeof issueRankingModelSchema>;
export type IssuesData = z.infer<typeof issuesDataSchema>;
export type BugReportResult = z.infer<typeof bugReportResultSchema>;
export type PrResult = z.infer<typeof prResultSchema>;
export type ModelsData = z.infer<typeof modelsDataSchema>;
export type GemmaModelInfo = ModelsData["models"][number];

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = { ok: false; error: { code: ErrorCode; message: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: ApiFailure["error"] };

export interface ValidatedImage {
  mimeType: AllowedImageMimeType;
  base64: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/** The only fields the logger accepts. Free-form data cannot be logged by design. */
export interface LogEvent {
  event: string;
  route?: string;
  status?: number;
  code?: ErrorCode;
  durationMs?: number;
  detail?: string;
}

export interface RepoRef {
  owner: string;
  repo: string;
}

/** A text file from a repo, always paired with its path so answers can cite it. */
export interface RepoFile {
  path: string;
  text: string;
}

export interface RepoTree {
  /** Filtered file paths, shallowest first, capped in length. */
  paths: string[];
  /** Number of useful files before the cap was applied. */
  totalFiles: number;
  truncated: boolean;
}

export interface GitHubIssue {
  number: number;
  title: string;
  url: string;
  labels: string[];
  comments: number;
  createdAt: string;
  body: string;
  isAssigned: boolean;
}

export interface ContributingDocs {
  contributing: RepoFile | null;
  issueTemplates: RepoFile[];
  pullRequestTemplate: RepoFile | null;
}
