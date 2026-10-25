import { GoogleGenAI } from "@google/genai";
import {
  BugReportDraft,
  ASTNodeMatch,
  DirectoryExplainer,
  RecommendedFile,
  GoodFirstIssue,
  PRDraft,
  ArchitectureMapData,
} from "@/types";
import { generateWithOllama, checkOllamaHealth } from "@/lib/ollama";

export function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: { timeout: 60_000, retryOptions: { attempts: 2 } },
  });
}

export function getGemmaModel(customModel?: string): string {
  const raw = customModel || process.env.GEMMA_MODEL || "gemma4:e2b";
  return raw.replace(/^models\//, "");
}

/**
 * Clean and extract JSON from model reply (removes markdown backticks and wraps)
 */
export function extractCleanJson<T>(rawText: string): T {
  const unfenced = rawText.replace(/\`\`\`(?:json)?/gi, "").trim();
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start === -1 || end <= start) {
    // Check if it's an array
    const arrStart = unfenced.indexOf("[");
    const arrEnd = unfenced.lastIndexOf("]");
    if (arrStart !== -1 && arrEnd > arrStart) {
      return JSON.parse(unfenced.slice(arrStart, arrEnd + 1)) as T;
    }
    throw new SyntaxError("No valid JSON structure found in model reply");
  }
  return JSON.parse(unfenced.slice(start, end + 1)) as T;
}

/**
 * Multimodal Visual Bug Triage using Local Gemma 4 via Ollama or Google Gemini API
 */
export async function analyzeScreenshotWithGemma({
  imageBase64,
  mimeType = "image/png",
  context = "",
  apiKey,
  modelName,
  repoTree = [],
  contributing = "",
}: {
  imageBase64?: string;
  mimeType?: string;
  context?: string;
  apiKey?: string;
  modelName?: string;
  repoTree?: string[];
  contributing?: string;
}): Promise<BugReportDraft | null> {
  const model = getGemmaModel(modelName);
  const fileTreeSample = repoTree.slice(0, 100).join("\n");

  const prompt = `You are Google Gemma 4, an elite software debugging and open-source issue triage agent.
Your mission is to perform visual error triage on the provided screenshot or error stack trace, correlate the visual callstack with the repository's actual file tree, and draft a high-quality, reproducible GitHub Bug Report.

User Observed Reproducer Context:
"${context || "Observed during local testing"}"

Repository File Tree Sample:
${fileTreeSample || "Standard repository structure"}

${contributing ? `Repository CONTRIBUTING guidelines:\n${contributing.slice(0, 1000)}` : "No custom CONTRIBUTING.md detected. Using standard open-source issue format."}

Analyze the image closely. Extract OCR text, error type, error message, and callstack. Correlate with the file tree to identify culprit files.

Output STRICT JSON with this exact schema (no additional markdown text, no code fences):
{
  "issueTitle": "[Bug]: <clear concise bug title>",
  "screenshotName": "error-trace.png",
  "resolution": "1240 × 820px",
  "ocrConfidence": "99% OCR CONFIDENCE",
  "ocrStatus": "Optical Character & Callstack Ingestion Complete",
  "errorType": "<e.g. TypeError, ReferenceError, SyntaxError, NetworkError>",
  "errorMessage": "<exact error message from visual OCR>",
  "callstack": [
    "at <component/function> (<file>:<line>:<col>)",
    "at <caller> (<file>:<line>:<col>)"
  ],
  "reproducerContext": "${context.replace(/"/g, '\\"') || "Observed during navigation or user action"}",
  "targetTemplate": "Target: issue-template.md",
  "summaryEvidence": {
    "text": "<1-2 sentence description explaining the visual evidence and root cause>",
    "codePills": ["<extracted symbol 1>", "<extracted symbol 2>", "<culprit file>"]
  },
  "stepsToReproduce": [
    "<Step 1: Where the user navigates>",
    "<Step 2: The exact trigger or interaction executed>",
    "<Step 3: The observed failure and crash>"
  ],
  "expectedBehavior": "<Plain English description of what should happen safely>",
  "actualBehavior": "<Plain English description of the uncaught crash>",
  "correlatedNodes": [
    {
      "filePath": "<suspected file path from file tree>",
      "matchScore": 94,
      "badgeLabel": "94% Match · Suspected Culprit",
      "badgeVariant": "crimson",
      "description": "<Detailed AST / code reason why this file caused the error>",
      "lineRange": "L42-L48",
      "functionName": "<suspected function name>"
    }
  ]
}`;

  if (!imageBase64) return null;

  // 1. Try Local Ollama First
  try {
    const ollamaCheck = await checkOllamaHealth();
    if (ollamaCheck.ok) {
      const targetLocalModel = model.includes("gemma") ? model : "gemma4:e2b";
      const ollamaRes = await generateWithOllama({
        model: targetLocalModel,
        prompt,
        images: [imageBase64],
        format: "json",
      });
      if (ollamaRes && ollamaRes.trim()) {
        return extractCleanJson<BugReportDraft>(ollamaRes);
      }
    }
  } catch (err) {
    console.warn("Local Ollama analysis skipped or failed:", err);
  }

  // 2. Fallback to Cloud Gemini API
  const ai = getGeminiClient(apiKey);
  if (ai) {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      const res = await ai.models.generateContent({
        model: model.includes("gemma4:e2b") ? "gemma-4-26b-a4b-it" : model,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 2500,
        },
      });

      return extractCleanJson<BugReportDraft>(res.text || "");
    } catch (err) {
      console.warn("Cloud Gemini analyzeScreenshot error:", err);
    }
  }

  return null;
}

/**
 * Live Gemma 4 Repository Explainer & Map (Local Ollama or Cloud Gemini)
 */
export async function explainRepoWithGemma({
  owner,
  repo,
  readme,
  fileTree,
  apiKey,
  modelName,
}: {
  owner: string;
  repo: string;
  readme: string;
  fileTree: string[];
  apiKey?: string;
  modelName?: string;
}): Promise<{
  directories: DirectoryExplainer[];
  recommendedFiles: RecommendedFile[];
  architectureMap?: ArchitectureMapData;
} | null> {
  const model = getGemmaModel(modelName);
  const prompt = `You are Google Gemma 4. Analyze the architecture of open-source repository ${owner}/${repo}.

README (trimmed):
${readme.slice(0, 6000)}

File Tree (top paths):
${fileTree.slice(0, 140).join("\n")}

Return STRICT JSON with:
{
  "directories": [
    {
      "path": "<folder path with trailing slash>",
      "title": "<Concise descriptive title>",
      "description": "<1-2 sentences on what this directory contains and its role>",
      "fileCount": "<estimated file count, e.g. 120+ files>",
      "importance": "high"
    }
  ],
  "recommendedFiles": [
    {
      "path": "<exact file path from file tree>",
      "githubUrl": "https://github.com/${owner}/${repo}/blob/main/<path>",
      "role": "<e.g. Client Navigation Component>",
      "whyStartHere": "<why this file has low cognitive load and is great for a newcomer>",
      "lines": 180,
      "difficulty": "Beginner"
    }
  ],
  "architectureMap": {
    "paradigm": "<e.g. Monorepo Workspace, Component Framework, Microservices>",
    "flowDescription": "<1 sentence on how data and execution flows across subsystems>",
    "layers": [
      {
        "layerNumber": "LAYER 01",
        "name": "<e.g. Public Surface & Ingestion Gateways>",
        "tagline": "<primary entrypoint file or folder>",
        "files": ["<file1>", "<file2>"],
        "role": "<short summary of layer role>"
      },
      {
        "layerNumber": "LAYER 02",
        "name": "<e.g. Core Processing Engine & Subsystems>",
        "tagline": "<engine or business logic path>",
        "files": ["<file1>", "<file2>"],
        "role": "<short summary of layer role>"
      },
      {
        "layerNumber": "LAYER 03",
        "name": "<e.g. Shared Primitives & Platform Drivers>",
        "tagline": "<primitives or database path>",
        "files": ["<file1>", "<file2>"],
        "role": "<short summary of layer role>"
      }
    ]
  }
}
Return only valid JSON. No markdown fences.`;

  // 1. Try Local Ollama First
  try {
    const ollamaCheck = await checkOllamaHealth();
    if (ollamaCheck.ok) {
      const targetLocalModel = model.includes("gemma") ? model : "gemma4:e2b";
      const ollamaRes = await generateWithOllama({
        model: targetLocalModel,
        prompt,
        format: "json",
      });
      if (ollamaRes && ollamaRes.trim()) {
        return extractCleanJson(ollamaRes);
      }
    }
  } catch (err) {
    console.warn("Local Ollama explainRepo skipped or failed:", err);
  }

  // 2. Fallback to Cloud Gemini API
  const ai = getGeminiClient(apiKey);
  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: model.includes("gemma4:e2b") ? "gemma-4-26b-a4b-it" : model,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 3500,
        },
      });
      return extractCleanJson(res.text || "");
    } catch (err) {
      console.warn("Cloud Gemini explainRepo error:", err);
    }
  }

  return null;
}

/**
 * Live Gemma 4 Good First Issue Ranker (Local Ollama or Cloud Gemini)
 */
export async function rankIssuesWithGemma({
  owner,
  repo,
  issues,
  fileTree,
  apiKey,
  modelName,
}: {
  owner: string;
  repo: string;
  issues: any[];
  fileTree: string[];
  apiKey?: string;
  modelName?: string;
}): Promise<GoodFirstIssue[] | null> {
  const model = getGemmaModel(modelName);
  const formattedIssues = issues.slice(0, 10).map((i) => ({
    number: i.number,
    title: i.title,
    body: (i.body || "").slice(0, 400),
    labels: (i.labels || []).map((l: any) => (typeof l === "string" ? l : l.name)),
  }));

  const prompt = `You are Google Gemma 4. Rank open GitHub issues for newcomer friendliness in ${owner}/${repo}.
Identify issues that are bounded in scope, have clear repro steps, or are "Unlabeled Beginner Gems" (beginner-friendly even if missing good-first-issue label).

Open Issues:
${JSON.stringify(formattedIssues, null, 2)}

File Tree sample:
${fileTree.slice(0, 80).join("\n")}

Return STRICT JSON array:
[
  {
    "number": <issue number>,
    "difficulty": "1/5 (Beginner)",
    "clarityScore": 95,
    "isUnlabeledGem": true,
    "category": "Frontend",
    "plainExplanation": "<1-2 sentence plain English explanation of what the issue asks>",
    "suspectedFiles": ["<path from file tree>"],
    "starterSteps": [
      "<Step 1 to locate code>",
      "<Step 2 to make change>",
      "<Step 3 to verify/test>"
    ]
  }
]
Return only valid JSON.`;

  // 1. Try Local Ollama First
  try {
    const ollamaCheck = await checkOllamaHealth();
    if (ollamaCheck.ok) {
      const targetLocalModel = model.includes("gemma") ? model : "gemma4:e2b";
      const ollamaRes = await generateWithOllama({
        model: targetLocalModel,
        prompt,
        format: "json",
      });
      if (ollamaRes && ollamaRes.trim()) {
        const parsed = extractCleanJson<any[]>(ollamaRes);
        if (Array.isArray(parsed)) {
          return mapIssuesOutput(parsed, issues, owner, repo, fileTree);
        }
      }
    }
  } catch (err) {
    console.warn("Local Ollama rankIssues skipped or failed:", err);
  }

  // 2. Fallback to Cloud Gemini API
  const ai = getGeminiClient(apiKey);
  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: model.includes("gemma4:e2b") ? "gemma-4-26b-a4b-it" : model,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 3000,
        },
      });

      const parsed = extractCleanJson<any[]>(res.text || "");
      if (Array.isArray(parsed)) {
        return mapIssuesOutput(parsed, issues, owner, repo, fileTree);
      }
    } catch (err) {
      console.warn("Cloud Gemini rankIssues error:", err);
    }
  }

  return null;
}

function mapIssuesOutput(
  parsed: any[],
  issues: any[],
  owner: string,
  repo: string,
  fileTree: string[]
): GoodFirstIssue[] {
  return parsed.map((item, idx) => {
    const orig = issues.find((i) => i.number === item.number) || issues[idx] || {};
    return {
      id: orig.id || 1000 + idx,
      number: orig.number || item.number || idx + 1,
      title: orig.title || "Open Community Issue",
      htmlUrl: orig.html_url || `https://github.com/${owner}/${repo}/issues/${item.number || idx + 1}`,
      difficulty: item.difficulty || "1/5 (Beginner)",
      clarityScore: item.clarityScore || 90,
      isUnlabeledGem: Boolean(item.isUnlabeledGem),
      category: item.category || "Frontend",
      plainExplanation: item.plainExplanation || orig.body?.slice(0, 200) || "Opportunity to resolve an open issue.",
      suspectedFiles: item.suspectedFiles || fileTree.slice(0, 2),
      starterSteps: item.starterSteps || [
        "Locate relevant source file in directory.",
        "Implement required adjustment and write tests.",
        "Open pull request with fix.",
      ],
      labels: (orig.labels || []).map((l: any) => (typeof l === "string" ? l : l.name)),
    };
  });
}

/**
 * Live Gemma 4 PR Helper (Local Ollama or Cloud Gemini)
 */
export async function generatePRWithGemma({
  owner,
  repo,
  diff,
  contributing,
  apiKey,
  modelName,
}: {
  owner: string;
  repo: string;
  diff: string;
  contributing?: string;
  apiKey?: string;
  modelName?: string;
}): Promise<PRDraft | null> {
  const model = getGemmaModel(modelName);
  const prompt = `You are Google Gemma 4. Evaluate this git diff for repository ${owner}/${repo} and write a clean, compliant PR title & description.

Git Diff:
${diff.slice(0, 4000)}

${contributing ? `Repository CONTRIBUTING.md rules:\n${contributing.slice(0, 2000)}` : "Notice: This repository DOES NOT HAVE a custom CONTRIBUTING.md. Evaluate against universal open-source standards: Conventional Commits, clean scope, verification test plan, zero unintended regressions."}

Return STRICT JSON with:
{
  "title": "<Conventional commit title, e.g. fix(scope): concise description>",
  "body": "<Complete PR markdown with Summary of Changes, Fixes Issue, Test Plan, and Checklist>",
  "checks": [
    {
      "id": "commit_title",
      "label": "Conventional Commit Title Format",
      "passed": true,
      "detail": "Follows conventional commits guidelines."
    },
    {
      "id": "linked_issue",
      "label": "Linked Issue Reference",
      "passed": true,
      "detail": "Includes Fixes #... directive."
    },
    {
      "id": "test_plan",
      "label": "Verification & Test Plan Included",
      "passed": true,
      "detail": "Verification steps specified."
    },
    {
      "id": "breaking_changes",
      "label": "Zero Breaking Changes Declared",
      "passed": true,
      "detail": "Backwards-compatible update."
    }
  ],
  "suspectedFiles": ["<modified file paths extracted from diff>"],
  "diffPreview": "${diff.slice(0, 500).replace(/"/g, '\\"')}"
}
Return only JSON.`;

  // 1. Try Local Ollama First
  try {
    const ollamaCheck = await checkOllamaHealth();
    if (ollamaCheck.ok) {
      const targetLocalModel = model.includes("gemma") ? model : "gemma4:e2b";
      const ollamaRes = await generateWithOllama({
        model: targetLocalModel,
        prompt,
        format: "json",
      });
      if (ollamaRes && ollamaRes.trim()) {
        return extractCleanJson<PRDraft>(ollamaRes);
      }
    }
  } catch (err) {
    console.warn("Local Ollama generatePR skipped or failed:", err);
  }

  // 2. Fallback to Cloud Gemini API
  const ai = getGeminiClient(apiKey);
  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: model.includes("gemma4:e2b") ? "gemma-4-26b-a4b-it" : model,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 2500,
        },
      });
      return extractCleanJson<PRDraft>(res.text || "");
    } catch (err) {
      console.warn("Cloud Gemini generatePR error:", err);
    }
  }

  return null;
}
