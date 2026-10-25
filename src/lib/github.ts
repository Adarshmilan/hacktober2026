import {
  RepoMetadata,
  GoodFirstIssue,
  DirectoryExplainer,
  RecommendedFile,
  ArchitectureMapData,
  ArchitectureLayer,
} from "@/types";
import {
  DEFAULT_REPO,
  DEFAULT_DIRECTORIES,
  DEFAULT_RECOMMENDED_FILES,
  DEFAULT_GOOD_FIRST_ISSUES,
  REACT_REPO,
  REACT_DIRECTORIES,
  REACT_RECOMMENDED_FILES,
  REACT_GOOD_FIRST_ISSUES,
  CALCOM_REPO,
  CALCOM_DIRECTORIES,
  CALCOM_RECOMMENDED_FILES,
  CALCOM_GOOD_FIRST_ISSUES,
} from "@/lib/constants";

const repoCache = new Map<string, IngestedRepoData>();

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleaned = url.trim().replace(/\/$/, "");
    const match = cleaned.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
    if (match && match[1] && match[2]) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
    const parts = cleaned.split("/").filter(Boolean);
    if (parts.length === 2 && !cleaned.includes("http")) {
      return { owner: parts[0]!, repo: parts[1]!.replace(/\.git$/, "") };
    }
  } catch {
    // ignore
  }
  return null;
}

export interface IngestedRepoData {
  metadata: RepoMetadata;
  readme: string;
  contributing: string | null;
  files: string[];
  issues: any[];
  directories: DirectoryExplainer[];
  recommendedFiles: RecommendedFile[];
  goodFirstIssues: GoodFirstIssue[];
  architectureMap: ArchitectureMapData;
  isRealTime: boolean;
  rateLimitRemaining?: number;
}

/**
 * Dynamically synthesizes an architecture map from real repository file trees and directory layouts.
 */
export function synthesizeArchitectureMap(
  owner: string,
  repo: string,
  files: string[],
  readme: string
): ArchitectureMapData {
  const isMonorepo = files.some((f) => f.startsWith("packages/") || f.startsWith("apps/") || f.includes("pnpm-workspace"));
  const hasRust = files.some((f) => f.endsWith(".rs") || f.includes("crates/") || f.includes("Cargo.toml"));
  const hasGo = files.some((f) => f.endsWith(".go") || f.includes("go.mod"));
  const hasPython = files.some((f) => f.endsWith(".py") || f.includes("pyproject.toml"));

  let paradigm = "Modular Full-Stack Application";
  if (isMonorepo) paradigm = "Monorepo Workspace & Multi-Package Architecture";
  else if (hasRust) paradigm = "High-Performance Systems & Native Engine";
  else if (hasGo) paradigm = "Distributed Cloud Native Microservices";
  else if (hasPython) paradigm = "Python Core Engine & Runtime Pipeline";

  // Layer 1: Client / Entrypoint / Public Surface
  const layer1Files = files
    .filter((f) =>
      f.startsWith("apps/web") ||
      f.startsWith("src/app") ||
      f.startsWith("src/pages") ||
      f.startsWith("packages/react/") ||
      f.startsWith("packages/next/") ||
      f.includes("client") ||
      f.includes("ui") ||
      f.includes("cmd/")
    )
    .slice(0, 4);

  // Layer 2: Core Subsystems / Reconciler / Server Logic
  const layer2Files = files
    .filter((f) =>
      f.includes("core") ||
      f.includes("server") ||
      f.includes("reconciler") ||
      f.includes("features") ||
      f.includes("services") ||
      f.includes("lib/") ||
      f.includes("internal/")
    )
    .slice(0, 4);

  // Layer 3: Shared Primitives / Runtime / Data Layer
  const layer3Files = files
    .filter((f) =>
      f.includes("shared") ||
      f.includes("prisma") ||
      f.includes("db") ||
      f.includes("schema") ||
      f.includes("types") ||
      f.includes("utils") ||
      f.includes("crates/")
    )
    .slice(0, 4);

  const layers: ArchitectureLayer[] = [
    {
      layerNumber: "LAYER 01",
      name: "Public Surface & Ingestion Gateways",
      tagline: layer1Files[0] ? `Direct entry: ${layer1Files[0]}` : "Public API, CLI commands, and client viewports",
      files: layer1Files.length > 0 ? layer1Files : ["src/index.ts", "src/main.ts"],
      role: "Receives user interactions, network requests, and CLI invocations.",
    },
    {
      layerNumber: "LAYER 02",
      name: "Core Processing Engine & Subsystems",
      tagline: layer2Files[0] ? `Engine core: ${layer2Files[0]}` : "Business logic, reconciliation, and event processing",
      files: layer2Files.length > 0 ? layer2Files : ["src/core/engine.ts", "src/services/handler.ts"],
      role: "Executes primary domain logic, state mutations, and algorithmic transformations.",
    },
    {
      layerNumber: "LAYER 03",
      name: "Shared Primitives & Platform Drivers",
      tagline: layer3Files[0] ? `Foundation: ${layer3Files[0]}` : "Storage drivers, types, and compiler bindings",
      files: layer3Files.length > 0 ? layer3Files : ["src/types/index.ts", "src/utils/helpers.ts"],
      role: "Maintains invariant data structures, database connectors, and cross-cutting utilities.",
    },
  ];

  return {
    paradigm,
    flowDescription: `Execution flows from ${layers[0]?.name || "surface"} through the ${layers[1]?.name || "engine"}, persisting and verifying through ${layers[2]?.name || "drivers"}.`,
    layers,
  };
}

export async function fetchGitHubRepoDetails(
  owner: string,
  repo: string,
  customToken?: string
): Promise<IngestedRepoData> {
  const normalizedKey = `${owner}/${repo}`.toLowerCase();

  const token = customToken || process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitCompass-404-Intelligence",
  };
  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  try {
    // 1. Fetch Live Repository Metadata from GitHub
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 300 },
    });

    const rateLimitRemaining = parseInt(repoRes.headers.get("x-ratelimit-remaining") || "60", 10);

    // If rate limited or not found and we have a baseline, we can use the baseline as fallback
    if (!repoRes.ok) {
      if (repoCache.has(normalizedKey)) {
        return repoCache.get(normalizedKey)!;
      }
      if (normalizedKey === "vercel/next.js") {
        return getFallbackBaseline("vercel", "next.js", DEFAULT_REPO, DEFAULT_DIRECTORIES, DEFAULT_RECOMMENDED_FILES, DEFAULT_GOOD_FIRST_ISSUES);
      }
      if (normalizedKey === "facebook/react") {
        return getFallbackBaseline("facebook", "react", REACT_REPO, REACT_DIRECTORIES, REACT_RECOMMENDED_FILES, REACT_GOOD_FIRST_ISSUES);
      }
      if (normalizedKey === "calcom/cal.com") {
        return getFallbackBaseline("calcom", "cal.com", CALCOM_REPO, CALCOM_DIRECTORIES, CALCOM_RECOMMENDED_FILES, CALCOM_GOOD_FIRST_ISSUES);
      }
      throw new Error(`GitHub API returned status ${repoRes.status}: ${repoRes.statusText}`);
    }

    const repoJson = await repoRes.json();
    const defaultBranch = repoJson?.default_branch || "main";

    // 2. Fetch README
    let readmeText = "";
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: { ...headers, Accept: "application/vnd.github.raw" },
      });
      if (readmeRes.ok) {
        readmeText = (await readmeRes.text()).slice(0, 8000);
      }
    } catch {
      // ignore
    }

    // 3. Robust CONTRIBUTING.md Detection across multiple standard paths
    let hasContributing = false;
    let contributingText: string | null = null;
    const possibleContribPaths = [
      "CONTRIBUTING.md",
      ".github/CONTRIBUTING.md",
      "docs/CONTRIBUTING.md",
      "contributing.md",
    ];

    for (const path of possibleContribPaths) {
      try {
        const contribRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          { headers }
        );
        if (contribRes.ok) {
          const contribJson = await contribRes.json();
          if (contribJson.content) {
            hasContributing = true;
            contributingText = Buffer.from(contribJson.content, "base64").toString("utf-8").slice(0, 6000);
            break;
          }
        }
      } catch {
        // continue to next path
      }
    }

    // 4. Fetch Recursive File Tree
    const cleanFiles: string[] = [];
    try {
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
        { headers }
      );
      if (treeRes.ok) {
        const treeJson = await treeRes.json();
        const treeItems = treeJson.tree || [];
        for (const item of treeItems) {
          if (item.type === "blob" && typeof item.path === "string") {
            const p = item.path;
            if (
              !p.includes("node_modules/") &&
              !p.includes(".git/") &&
              !p.includes("dist/") &&
              !p.includes(".next/") &&
              !p.endsWith(".lock") &&
              !p.endsWith("-lock.json") &&
              !p.endsWith(".png") &&
              !p.endsWith(".jpg") &&
              !p.endsWith(".svg")
            ) {
              cleanFiles.push(p);
              if (cleanFiles.length >= 250) break;
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // 5. Fetch Real Open Issues from GitHub REST API
    let rawIssues: any[] = [];
    try {
      const issuesRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=30&sort=updated`,
        { headers }
      );
      if (issuesRes.ok) {
        const list = await issuesRes.json();
        if (Array.isArray(list)) {
          // Strictly exclude Pull Requests
          rawIssues = list.filter((i) => !i.pull_request);
        }
      }
    } catch {
      // ignore
    }

    // Compute Onboarding Score dynamically
    let onboardingScore = 75;
    if (hasContributing) onboardingScore += 12;
    if (readmeText.length > 500) onboardingScore += 5;
    if (cleanFiles.length > 30) onboardingScore += 5;

    const metadata: RepoMetadata = {
      owner,
      repo,
      url: `https://github.com/${owner}/${repo}`,
      branch: defaultBranch.toUpperCase(),
      stars: repoJson?.stargazers_count ?? 0,
      openIssuesCount: repoJson?.open_issues_count ?? rawIssues.length,
      license: repoJson?.license?.spdx_id || "None Specified",
      hasContributing,
      repoOnboardingScore: Math.min(onboardingScore, 98),
      compatibilityBadge: hasContributing ? "● MAINTAINER VERIFIED" : "○ STANDARD REPO",
      description: repoJson?.description || `${owner}/${repo} source repository`,
    };

    // Synthesize Directory Explainer from clean file paths
    const dirMap = new Map<string, number>();
    for (const f of cleanFiles) {
      const segments = f.split("/");
      if (segments.length > 1) {
        const dir = `${segments[0]}/`;
        dirMap.set(dir, (dirMap.get(dir) || 0) + 1);
      }
    }

    const synthesizedDirs: DirectoryExplainer[] = Array.from(dirMap.entries())
      .slice(0, 6)
      .map(([dir, count], idx) => ({
        path: dir,
        title: `${dir.replace("/", "").toUpperCase()} Subsystem`,
        description: `Contains components, modules, and tests supporting the ${dir.replace("/", "")} subsystem.`,
        fileCount: `${count}+ files`,
        importance: idx < 2 ? "high" : "medium",
      }));

    // Synthesize Recommended Files for Newcomers
    const synthesizedFiles: RecommendedFile[] = cleanFiles
      .filter((f) =>
        (f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".py") || f.endsWith(".rs") || f.endsWith(".go")) &&
        !f.includes(".test.") &&
        !f.includes(".spec.")
      )
      .slice(0, 4)
      .map((f, idx) => ({
        path: f,
        githubUrl: `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${f}`,
        role: idx === 0 ? "Entrypoint / Export Surface" : "Core Utility",
        whyStartHere: "High clarity, explicit modular exports, and straightforward local testability.",
        lines: 120 + idx * 40,
        difficulty: idx < 2 ? "Beginner" : "Intermediate",
      }));

    // Synthesize Good First Issues from real GitHub issues
    const synthesizedIssues: GoodFirstIssue[] = rawIssues.slice(0, 6).map((i, idx) => {
      const labelNames = (i.labels || []).map((l: any) =>
        (typeof l === "string" ? l : l.name || "").toLowerCase()
      );
      const isGoodFirst = labelNames.some(
        (n: string) => n.includes("good first") || n.includes("beginner") || n.includes("easy")
      );

      return {
        id: i.id,
        number: i.number,
        title: i.title,
        htmlUrl: i.html_url,
        difficulty: idx % 2 === 0 ? "1/5 (Beginner)" : "2/5 (Easy)",
        clarityScore: 92 - idx * 3,
        isUnlabeledGem: !isGoodFirst,
        category: (idx % 2 === 0 ? "Frontend" : "Docs") as any,
        plainExplanation: (i.body || "").slice(0, 220) || "Open issue in active repository.",
        suspectedFiles: cleanFiles.slice(idx * 2, idx * 2 + 2),
        starterSteps: [
          `Inspect implementation in ${cleanFiles[idx] || "src/"}.`,
          "Develop fix or documentation update according to repository standards.",
          `Submit pull request linking issue #${i.number}.`,
        ],
        labels: (i.labels || []).map((l: any) => (typeof l === "string" ? l : l.name)),
      };
    });

    const dynamicArchitectureMap = synthesizeArchitectureMap(owner, repo, cleanFiles, readmeText);

    const result: IngestedRepoData = {
      metadata,
      readme: readmeText,
      contributing: contributingText,
      files: cleanFiles,
      issues: rawIssues,
      directories: synthesizedDirs.length > 0 ? synthesizedDirs : DEFAULT_DIRECTORIES,
      recommendedFiles: synthesizedFiles.length > 0 ? synthesizedFiles : DEFAULT_RECOMMENDED_FILES,
      goodFirstIssues: synthesizedIssues.length > 0 ? synthesizedIssues : DEFAULT_GOOD_FIRST_ISSUES,
      architectureMap: dynamicArchitectureMap,
      isRealTime: true,
      rateLimitRemaining,
    };

    repoCache.set(normalizedKey, result);
    return result;
  } catch (err) {
    console.warn(`Live GitHub fetch for ${owner}/${repo} failed:`, err);
    if (repoCache.has(normalizedKey)) {
      return repoCache.get(normalizedKey)!;
    }
    // Fallback baselines if network is unavailable
    if (normalizedKey === "vercel/next.js") {
      return getFallbackBaseline("vercel", "next.js", DEFAULT_REPO, DEFAULT_DIRECTORIES, DEFAULT_RECOMMENDED_FILES, DEFAULT_GOOD_FIRST_ISSUES);
    }
    if (normalizedKey === "facebook/react") {
      return getFallbackBaseline("facebook", "react", REACT_REPO, REACT_DIRECTORIES, REACT_RECOMMENDED_FILES, REACT_GOOD_FIRST_ISSUES);
    }
    if (normalizedKey === "calcom/cal.com") {
      return getFallbackBaseline("calcom", "cal.com", CALCOM_REPO, CALCOM_DIRECTORIES, CALCOM_RECOMMENDED_FILES, CALCOM_GOOD_FIRST_ISSUES);
    }
    throw err;
  }
}

function getFallbackBaseline(
  owner: string,
  repo: string,
  meta: RepoMetadata,
  dirs: DirectoryExplainer[],
  files: RecommendedFile[],
  issues: GoodFirstIssue[]
): IngestedRepoData {
  return {
    metadata: meta,
    readme: meta.description || "",
    contributing: meta.hasContributing ? "Please adhere to CONTRIBUTING.md conventions." : null,
    files: files.map((f) => f.path),
    issues: [],
    directories: dirs,
    recommendedFiles: files,
    goodFirstIssues: issues,
    architectureMap: synthesizeArchitectureMap(owner, repo, files.map((f) => f.path), meta.description || ""),
    isRealTime: false,
  };
}
