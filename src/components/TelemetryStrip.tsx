"use client";

import React from "react";
import { GitBranch, Star, AlertCircle, FileCode, CheckCircle2 } from "lucide-react";
import { RepoMetadata } from "@/types";

interface TelemetryStripProps {
  metadata: RepoMetadata;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  isLoading?: boolean;
  loadingStep?: string;
}

export function TelemetryStrip({
  metadata,
  activeTab,
  setActiveTab,
  isLoading,
  loadingStep,
}: TelemetryStripProps) {
  const tabs = [
    {
      id: 0,
      label: "01 Repo Explainer & Map",
      badge: null,
    },
    {
      id: 1,
      label: "02 Good-First-Issue Finder",
      badge: "14 Gems",
    },
    {
      id: 2,
      label: "03 Screenshot → Bug Report",
      badge: "MULTIMODAL",
    },
    {
      id: 3,
      label: "04 PR Description & Rules Helper",
      badge: null,
    },
  ];

  return (
    <div className="shrink-0 bg-white">
      {/* Live Sleek Monochrome Step-by-Step Telemetry Loader */}
      {isLoading && (
        <div className="bg-zinc-950 text-zinc-100 border-b border-zinc-800 px-8 py-2.5 flex items-center justify-between text-xs font-mono shadow-inner animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-zinc-200 font-semibold tracking-wide">
              {loadingStep || "[1/3 Fetching GitHub Tree & Docs...] → [2/3 Running Gemma 4 Multimodal Inference...] → [3/3 Correlating AST & Formatting Output...]"}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono font-medium">
            ● GOOGLE GEMMA 4 INFERENCE TELEMETRY
          </span>
        </div>
      )}

      {/* Repo Telemetry Sub-Header */}
      <div className="bg-zinc-50/80 border-b border-zinc-200 px-8 py-3 flex items-center justify-between flex-wrap gap-4">
        {/* Left metadata row */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-zinc-800" />
            <span className="font-bold text-sm text-zinc-950">
              {metadata.owner} / {metadata.repo}
            </span>
            <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 font-semibold">
              {metadata.branch}
            </span>
          </div>

          <span className="text-zinc-300">·</span>

          <div className="flex items-center gap-1.5 font-medium">
            <Star className="w-3.5 h-3.5 text-zinc-700" />
            <span>{(metadata.stars / 1000).toFixed(0)}k Stars</span>
          </div>

          <span className="text-zinc-300">·</span>

          <div className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-700" />
            <span>⊙ {metadata.openIssuesCount} Open Issues</span>
          </div>

          <span className="text-zinc-300">·</span>

          <div className="flex items-center gap-1.5 font-medium">
            <FileCode className="w-3.5 h-3.5 text-zinc-700" />
            <span>License: {metadata.license}</span>
          </div>

          <span className="text-zinc-300">·</span>

          {metadata.hasContributing ? (
            <div className="flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>CONTRIBUTING.md: Detected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>CONTRIBUTING.md: Not Detected</span>
            </div>
          )}
        </div>

        {/* Right readiness meter */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-mono font-semibold text-zinc-700">
              REPO ONBOARDING SCORE {metadata.repoOnboardingScore}/100
            </span>
            <div className="w-32 h-1.5 bg-zinc-200 rounded-full overflow-hidden flex">
              <div
                className="bg-zinc-950 h-full rounded-full transition-all"
                style={{ width: `${metadata.repoOnboardingScore}%` }}
              />
            </div>
          </div>

          <div
            className={`border text-[10px] font-mono font-semibold px-2.5 py-1 rounded flex items-center gap-1.5 ${
              metadata.hasContributing
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-zinc-100 text-zinc-700 border-zinc-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                metadata.hasContributing ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
              }`}
            />
            <span>{metadata.compatibilityBadge}</span>
          </div>
        </div>
      </div>

      {/* Horizontal 5-Tab Bar */}
      <div className="bg-white border-b border-zinc-200 px-8 py-2.5 flex items-center gap-4 overflow-x-auto">
        {[
          { id: 0, label: "01 Repo Explainer & Map", badge: null },
          { id: 1, label: "02 Good-First-Issue Finder", badge: "GEMS" },
          { id: 2, label: "03 Screenshot → Bug Report", badge: "MULTIMODAL" },
          { id: 3, label: "04 PR Description & Rules Helper", badge: null },
          { id: 4, label: "05 Executive Dossier & PDF", badge: "EXPORT" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 font-medium"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold tracking-wider ${
                    isActive
                      ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                      : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
