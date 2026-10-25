"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { TelemetryStrip } from "@/components/TelemetryStrip";
import { BugReportTab } from "@/components/tabs/BugReportTab";
import { RepoExplainerTab } from "@/components/tabs/RepoExplainerTab";
import { GoodFirstIssueTab } from "@/components/tabs/GoodFirstIssueTab";
import { PRHelperTab } from "@/components/tabs/PRHelperTab";
import { PdfReportTab } from "@/components/tabs/PdfReportTab";
import { SettingsModal } from "@/components/SettingsModal";
import { LandingPage } from "@/components/LandingPage";
import {
  DEFAULT_REPO,
  DEFAULT_BUG_REPORT,
  DEFAULT_DIRECTORIES,
  DEFAULT_RECOMMENDED_FILES,
  DEFAULT_GOOD_FIRST_ISSUES,
} from "@/lib/constants";
import {
  RepoMetadata,
  BugReportDraft,
  DirectoryExplainer,
  RecommendedFile,
  GoodFirstIssue,
  AppSettings,
  ArchitectureMapData,
} from "@/types";

export default function Home() {
  const [viewMode, setViewMode] = useState<"landing" | "workspace">("landing");
  const [repoUrl, setRepoUrl] = useState<string>("https://github.com/vercel/next.js");
  const [metadata, setMetadata] = useState<RepoMetadata>(DEFAULT_REPO);
  const [report, setReport] = useState<BugReportDraft>(DEFAULT_BUG_REPORT);
  const [directories, setDirectories] = useState<DirectoryExplainer[]>(DEFAULT_DIRECTORIES);
  const [recommendedFiles, setRecommendedFiles] = useState<RecommendedFile[]>(DEFAULT_RECOMMENDED_FILES);
  const [issues, setIssues] = useState<GoodFirstIssue[]>(DEFAULT_GOOD_FIRST_ISSUES);
  const [architectureMap, setArchitectureMap] = useState<ArchitectureMapData | undefined>(undefined);

  // Tab 0: Repo Explainer & Map
  // Tab 1: Good-First-Issue Finder
  // Tab 2: Screenshot -> Bug Report
  // Tab 3: PR Description & Rules Helper
  // Tab 4: Executive Dossier & PDF Export
  const [activeTab, setActiveTab] = useState<number>(0);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isProcessingScreenshot, setIsProcessingScreenshot] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<AppSettings>({
    geminiApiKey: "",
    githubToken: "",
    gemmaModel: "gemma-4-26b-a4b-it",
  });

  // Load stored settings and check query params on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gitcompass_settings");
      if (stored) {
        setSettings(JSON.parse(stored));
      }
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("view") === "workspace") {
          setViewMode("workspace");
        }
        const target = params.get("repo") || params.get("url");
        if (target) {
          setRepoUrl(target);
          handleAnalyzeRepo(target);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem("gitcompass_settings", JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  const handleLaunchWorkspace = (targetRepo?: string, initialTab?: number) => {
    const chosenRepo = targetRepo || repoUrl;
    setRepoUrl(chosenRepo);

    if (typeof initialTab === "number") {
      setActiveTab(initialTab);
    }
    setViewMode("workspace");

    handleAnalyzeRepo(chosenRepo);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAnalyzeRepo = async (targetUrl?: string) => {
    const url = targetUrl || repoUrl;
    setIsAnalyzing(true);
    setLoadingStep("[1/3 Querying GitHub REST API & Checking CONTRIBUTING.md...]");

    const timer1 = setTimeout(() => {
      setLoadingStep("[2/3 Running Google Gemma 4 Inference & Synthesizing Subsystems...]");
    }, 450);

    const timer2 = setTimeout(() => {
      setLoadingStep("[3/3 Correlating AST Graph & Generating Dynamic Blueprint...]");
    }, 900);

    try {
      const res = await fetch("/api/analyze-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: url,
          geminiApiKey: settings.geminiApiKey,
          githubToken: settings.githubToken,
          gemmaModel: settings.gemmaModel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.metadata) setMetadata(data.metadata);
        if (data.directories && data.directories.length > 0) setDirectories(data.directories);
        if (data.recommendedFiles && data.recommendedFiles.length > 0) setRecommendedFiles(data.recommendedFiles);
        if (data.issues && data.issues.length > 0) setIssues(data.issues);
        if (data.architectureMap) setArchitectureMap(data.architectureMap);
      }
    } catch (err) {
      console.warn("Failed to analyze repo, active state preserved:", err);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsAnalyzing(false);
      setLoadingStep("");
    }
  };

  const handleRerunGemmaAnalysis = async (
    contextOverride?: string,
    imageBase64?: string
  ) => {
    setIsProcessingScreenshot(true);
    setLoadingStep("[1/3 Ingesting Screenshot OCR & Callstack...]");

    const timer1 = setTimeout(() => {
      setLoadingStep("[2/3 Running Gemma 4 Multimodal Vision Inference...]");
    }, 450);

    const timer2 = setTimeout(() => {
      setLoadingStep("[3/3 Correlating AST Culprits & Formatting Report...]");
    }, 900);

    try {
      const res = await fetch("/api/screenshot-to-bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: contextOverride || report.reproducerContext,
          imageBase64,
          geminiApiKey: settings.geminiApiKey,
          gemmaModel: settings.gemmaModel,
          fileName: report.screenshotName,
          repoUrl,
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.warn("Failed to re-run Gemma analysis:", err);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsProcessingScreenshot(false);
      setLoadingStep("");
    }
  };

  return (
    <>
      {viewMode === "landing" ? (
        <LandingPage
          onLaunchWorkspace={handleLaunchWorkspace}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-950 font-sans antialiased">
          {/* ZONE A: Global Header */}
          <Header
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            onAnalyze={handleAnalyzeRepo}
            isAnalyzing={isAnalyzing}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onBackToLanding={() => setViewMode("landing")}
          />

          <div className="flex-1 flex overflow-hidden">
            {/* ZONE B: Left Sidebar */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onBackToLanding={() => setViewMode("landing")}
            />

            {/* Main Workspace Area */}
            <main className="flex-1 flex flex-col overflow-y-auto">
              {/* ZONE C: Telemetry Strip & Tab Bar */}
              <TelemetryStrip
                metadata={metadata}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isLoading={isAnalyzing || isProcessingScreenshot}
                loadingStep={loadingStep}
              />

              {/* TAB CONTENTS */}
              <div className="flex-1">
                {activeTab === 0 && (
                  <RepoExplainerTab
                    metadata={metadata}
                    directories={directories}
                    recommendedFiles={recommendedFiles}
                    architectureMap={architectureMap}
                  />
                )}

                {activeTab === 1 && (
                  <GoodFirstIssueTab issues={issues} metadata={metadata} />
                )}

                {activeTab === 2 && (
                  <BugReportTab
                    report={report}
                    setReport={setReport}
                    metadata={metadata}
                    onRerun={handleRerunGemmaAnalysis}
                    isProcessing={isProcessingScreenshot}
                  />
                )}

                {activeTab === 3 && <PRHelperTab metadata={metadata} />}

                {activeTab === 4 && (
                  <PdfReportTab
                    metadata={metadata}
                    directories={directories}
                    recommendedFiles={recommendedFiles}
                    issues={issues}
                    bugReport={report}
                    architectureMap={architectureMap}
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* Settings Modal (accessible from both Landing Page and Workspace) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </>
  );
}
