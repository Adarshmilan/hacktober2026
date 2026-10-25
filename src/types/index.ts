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

// -------------------------------------------------------------
// OpenCompass High-Craft Architecture & UI Types
// -------------------------------------------------------------

export interface RepoMetadata {
  owner: string;
  repo: string;
  url: string;
  branch: string;
  stars: number;
  openIssuesCount: number;
  license: string;
  hasContributing: boolean;
  repoOnboardingScore: number;
  compatibilityBadge: string;
  description?: string;
}

export interface ASTNodeMatch {
  filePath: string;
  matchScore: number;
  badgeLabel: string;
  badgeVariant: "crimson" | "zinc" | "emerald";
  description: string;
  lineRange?: string;
  functionName?: string;
}

export interface BugReportDraft {
  issueTitle: string;
  screenshotName: string;
  resolution: string;
  ocrConfidence: string;
  ocrStatus: string;
  errorType: string;
  errorMessage: string;
  callstack: string[];
  reproducerContext: string;
  targetTemplate: string;
  summaryEvidence: {
    text: string;
    codePills: string[];
  };
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  correlatedNodes: ASTNodeMatch[];
}

export interface DirectoryExplainer {
  path: string;
  title: string;
  description: string;
  fileCount?: string;
  importance: "high" | "medium" | "low";
}

export interface RecommendedFile {
  path: string;
  githubUrl: string;
  role: string;
  whyStartHere: string;
  lines: number;
  difficulty: "Beginner" | "Intermediate";
}

export interface GoodFirstIssue {
  id: number;
  number: number;
  title: string;
  htmlUrl: string;
  difficulty: "1/5 (Beginner)" | "2/5 (Easy)" | "3/5 (Medium)" | "4/5 (Challenging)" | "5/5 (Hard)";
  clarityScore: number;
  isUnlabeledGem: boolean;
  category: "Frontend" | "Docs" | "Backend" | "Infra";
  plainExplanation: string;
  suspectedFiles: string[];
  starterSteps: string[];
  labels: string[];
}

export interface PRComplianceCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface PRDraft {
  title: string;
  body: string;
  checks: PRComplianceCheck[];
  suspectedFiles: string[];
  diffPreview: string;
}

export interface AppSettings {
  geminiApiKey: string;
  githubToken: string;
  gemmaModel: string;
}

export interface ArchitectureLayer {
  layerNumber: string;
  name: string;
  tagline: string;
  files: string[];
  role: string;
}

export interface ArchitectureMapData {
  paradigm: string;
  flowDescription: string;
  layers: ArchitectureLayer[];
}

export interface TelemetryMetrics {
  activeModel: string;
  visionSubsystem: string;
  latencyMs: number;
  tokensProcessed: number;
  astNodesIndexed: number;
  rateLimitRemaining: number;
  contributingFound: boolean;
}

