import { NextResponse } from "next/server";
import { parseGitHubUrl, fetchGitHubRepoDetails } from "@/lib/github";
import { explainRepoWithGemma, rankIssuesWithGemma } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const repoUrl = body.repoUrl || "";
    const customApiKey = body.geminiApiKey;
    const customToken = body.githubToken;
    const customModel = body.gemmaModel;

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid GitHub repository URL. Use format: https://github.com/owner/repo or owner/repo",
        },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;
    
    // Ingest repository details and files
    const details = await fetchGitHubRepoDetails(owner, repo, customToken);

    let dynamicDirectories = details.directories;
    let dynamicFiles = details.recommendedFiles;
    let dynamicIssues = details.goodFirstIssues;

    // Run Gemma 4 AI Analysis if API key is provided
    if (customApiKey || process.env.GEMINI_API_KEY) {
      try {
        const [gemmaExplainer, gemmaIssues] = await Promise.all([
          explainRepoWithGemma({
            owner,
            repo,
            readme: details.readme,
            fileTree: details.files,
            apiKey: customApiKey,
            modelName: customModel,
          }),
          details.issues.length > 0
            ? rankIssuesWithGemma({
                owner,
                repo,
                issues: details.issues,
                fileTree: details.files,
                apiKey: customApiKey,
                modelName: customModel,
              })
            : null,
        ]);

        if (gemmaExplainer?.directories && gemmaExplainer.directories.length > 0) {
          dynamicDirectories = gemmaExplainer.directories;
        }
        if (gemmaExplainer?.recommendedFiles && gemmaExplainer.recommendedFiles.length > 0) {
          dynamicFiles = gemmaExplainer.recommendedFiles;
        }
        let dynamicArchitectureMap = details.architectureMap;
        if (gemmaExplainer?.architectureMap) {
          dynamicArchitectureMap = gemmaExplainer.architectureMap;
        }

        return NextResponse.json({
          success: true,
          metadata: details.metadata,
          directories: dynamicDirectories,
          recommendedFiles: dynamicFiles,
          issues: dynamicIssues,
          architectureMap: dynamicArchitectureMap,
          contributing: details.contributing,
          rateLimitRemaining: details.rateLimitRemaining,
          source: customApiKey || process.env.GEMINI_API_KEY ? "gemma_4_live" : "grounded_github",
        });
      } catch (e) {
        console.warn("Gemma live analysis failed, using high-craft fallback:", e);
      }
    }

    return NextResponse.json({
      success: true,
      metadata: details.metadata,
      directories: dynamicDirectories,
      recommendedFiles: dynamicFiles,
      issues: dynamicIssues,
      architectureMap: details.architectureMap,
      contributing: details.contributing,
      rateLimitRemaining: details.rateLimitRemaining,
      source: "grounded_github",
    });
  } catch (err: any) {
    console.error("API /api/analyze-repo error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to analyze repository" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const repoUrl = searchParams.get("url") || searchParams.get("repo") || "https://github.com/vercel/next.js";
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return NextResponse.json({ success: false, error: "Invalid URL" }, { status: 400 });
  }
  const details = await fetchGitHubRepoDetails(parsed.owner, parsed.repo);
  return NextResponse.json({
    success: true,
    metadata: details.metadata,
    directories: details.directories,
    recommendedFiles: details.recommendedFiles,
    issues: details.goodFirstIssues,
  });
}
