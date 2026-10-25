"use client";

import React, { useState } from "react";
import {
  GitPullRequest,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  FileDiff,
  CheckCircle2,
  FileCode,
  Sparkles,
  AlertTriangle,
  Info,
} from "lucide-react";
import { PRDraft, RepoMetadata } from "@/types";
import { DEFAULT_PR_DRAFT } from "@/lib/constants";

interface PRHelperTabProps {
  metadata: RepoMetadata;
}

export function PRHelperTab({ metadata }: PRHelperTabProps) {
  const [prDraft, setPrDraft] = useState<PRDraft>(DEFAULT_PR_DRAFT);
  const [diffInput, setDiffInput] = useState<string>(DEFAULT_PR_DRAFT.diffPreview);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleLoadSampleDiff = () => {
    setDiffInput(DEFAULT_PR_DRAFT.diffPreview);
    setPrDraft(DEFAULT_PR_DRAFT);
  };

  const handleClearDiff = () => {
    setDiffInput("");
  };

  const handleGeneratePR = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/pr-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diff: diffInput,
          repoUrl: metadata.url,
        }),
      });
      const data = await res.json();
      if (data.success && data.prDraft) {
        setPrDraft(data.prDraft);
      }
    } catch (err) {
      console.warn("PR generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    const fullText = `# ${prDraft.title}\n\n${prDraft.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenGitHubPR = () => {
    const title = encodeURIComponent(prDraft.title);
    const body = encodeURIComponent(prDraft.body);
    const url = `https://github.com/${metadata.owner}/${metadata.repo}/compare?quick_pull=1&title=${title}&body=${body}`;
    window.open(url, "_blank");
  };

  const passedCount = prDraft.checks.filter((c) => c.passed).length;
  const compliancePercentage = Math.round((passedCount / (prDraft.checks.length || 1)) * 100);

  return (
    <div className="grid grid-cols-12 gap-6 p-8 max-w-[1440px] mx-auto w-full">
      {/* LEFT COLUMN: Git Diff Input & Compliance Checklist */}
      <div className="col-span-12 lg:col-span-6 space-y-6">
        {/* Diff Input Box */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <FileDiff className="w-4 h-4 text-zinc-800" />
                <span>Working Git Diff / Changed Files</span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-400 font-medium">
                INPUT PATCH FOR RULE COMPLIANCE EVALUATION
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLoadSampleDiff}
                className="text-xs font-medium text-zinc-700 hover:text-zinc-950 underline font-sans cursor-pointer"
              >
                Sample Diff
              </button>
              <button
                type="button"
                onClick={handleClearDiff}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-700 font-sans cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <textarea
              rows={11}
              value={diffInput}
              onChange={(e) => setDiffInput(e.target.value)}
              placeholder="Paste your git diff or patch here (git diff HEAD~1)..."
              className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-zinc-800 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all resize-y shadow-2xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={isGenerating || !diffInput.trim()}
              onClick={handleGeneratePR}
              className="bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-50 text-xs font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isGenerating ? "Evaluating Rules & Generating..." : "Generate PR Description"}</span>
            </button>
            <span className="text-[11px] font-mono text-zinc-400">
              {metadata.hasContributing ? "Grounded to CONTRIBUTING.md" : "Standard Open-Source Rules"}
            </span>
          </div>
        </div>

        {/* CONTRIBUTING.md Compliance Checklist */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <ShieldCheck
                  className={`w-4 h-4 ${metadata.hasContributing ? "text-emerald-700" : "text-zinc-700"}`}
                />
                <span>
                  {metadata.hasContributing
                    ? "CONTRIBUTING.md Compliance Checklist"
                    : "Universal Open-Source Merge Gates"}
                </span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-400 font-medium">
                {metadata.hasContributing
                  ? "AUTOMATED REPOSITORY MERGE-GATE VALIDATION"
                  : "CONVENTIONAL COMMITS & SCOPE AUDIT"}
              </p>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                metadata.hasContributing
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-zinc-100 text-zinc-700 border-zinc-200"
              }`}
            >
              {compliancePercentage}% Passed ({passedCount}/{prDraft.checks.length})
            </span>
          </div>

          {!metadata.hasContributing && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-700 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-zinc-900">
                  CONTRIBUTING.md not detected in this repository
                </span>
                <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">
                  GitCompass evaluated general open-source standards (Conventional Commit prefix, scoped modifications, verification plan, backwards compatibility).
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {prDraft.checks.map((check) => (
              <div
                key={check.id}
                className="border border-zinc-200 rounded-lg p-3 bg-zinc-50/50 flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900">
                      {check.label}
                    </h5>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                      {check.detail}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                  PASS
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Generated PR Description */}
      <div className="col-span-12 lg:col-span-6 space-y-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-zinc-800" />
                <span>Generated Pull Request Description</span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-400 font-medium">
                TAILORED TO REPO CONTRIBUTING RULES
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Copy PR Markdown</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenGitHubPR}
                className="bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-medium px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Compare & Open PR</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
              </button>
            </div>
          </div>

          {/* Editable PR Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
              PULL REQUEST TITLE
            </label>
            <input
              type="text"
              value={prDraft.title}
              onChange={(e) =>
                setPrDraft((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full text-xs font-semibold font-mono text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Editable PR Body */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
              PULL REQUEST BODY (MARKDOWN)
            </label>
            <textarea
              rows={16}
              value={prDraft.body}
              onChange={(e) =>
                setPrDraft((prev) => ({ ...prev, body: e.target.value }))
              }
              className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-zinc-800 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all resize-y shadow-2xs leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
