"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Filter,
  FileCode2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { GoodFirstIssue, RepoMetadata } from "@/types";

interface GoodFirstIssueTabProps {
  issues: GoodFirstIssue[];
  metadata: RepoMetadata;
}

export function GoodFirstIssueTab({
  issues,
  metadata,
}: GoodFirstIssueTabProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const filterOptions = [
    { id: "All", label: "All Ranked Issues" },
    { id: "Beginner", label: "Difficulty 1/5 (Beginner)" },
    { id: "Unlabeled", label: "Unlabeled Hidden Gems" },
    { id: "Frontend", label: "Frontend / Docs" },
  ];

  const filteredIssues = issues.filter((issue) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Beginner") return issue.difficulty.includes("1/5");
    if (selectedFilter === "Unlabeled") return issue.isUnlabeledGem;
    if (selectedFilter === "Frontend")
      return issue.category === "Frontend" || issue.category === "Docs";
    return true;
  });

  return (
    <div className="p-8 max-w-[1440px] mx-auto w-full space-y-6">
      {/* Top Controls & Filter Pills */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-800" />
            <span>Good-First-Issue Finder & Hidden Gem Scorer</span>
          </h3>
          <p className="text-[10px] font-mono text-zinc-400 font-medium">
            RANKED BY CLARITY, BOUNDED SCOPE & REPRODUCIBILITY
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  isActive
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ranked Issue Cards */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs hover:border-zinc-300 transition-all space-y-4"
          >
            {/* Top Row: Title, ID, Badges, Link */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
                    #{issue.number}
                  </span>
                  <h4 className="font-bold text-sm text-zinc-950 font-sans">
                    {issue.title}
                  </h4>
                  {issue.isUnlabeledGem && (
                    <span className="bg-zinc-950 text-white text-[10px] font-mono px-2 py-0.5 rounded font-medium shadow-2xs">
                      ★ Unlabeled Gem
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                    {issue.difficulty}
                  </span>
                  <span className="bg-zinc-100 text-zinc-700 border border-zinc-200 text-[10px] font-mono px-2 py-0.5 rounded font-medium">
                    Clarity Score: {issue.clarityScore}%
                  </span>
                  <span className="text-zinc-400 font-mono text-[11px]">
                    Category: {issue.category}
                  </span>
                </div>
              </div>

              <a
                href={issue.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Open Issue on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
              </a>
            </div>

            {/* Plain-Language Explanation */}
            <div className="bg-zinc-50/70 border border-zinc-200 rounded-lg p-3.5 text-xs text-zinc-700 leading-relaxed font-sans">
              <strong className="text-zinc-900 font-semibold block mb-0.5">
                Plain-Language Overview:
              </strong>
              {issue.plainExplanation}
            </div>

            {/* Suspected Files Involved */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-mono text-[11px] text-zinc-500 font-semibold">
                Suspected Files Involved:
              </span>
              {issue.suspectedFiles.map((file, fIdx) => (
                <span
                  key={fIdx}
                  className="font-mono text-[11px] bg-zinc-100 border border-zinc-200 text-zinc-800 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  <FileCode2 className="w-3 h-3 text-zinc-400" />
                  <span>{file}</span>
                </span>
              ))}
            </div>

            {/* 3-Step Starter Approach */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                3-STEP STARTER APPROACH
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {issue.starterSteps.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="border border-zinc-200 rounded-lg p-2.5 bg-zinc-50/50 flex items-start gap-2 text-xs shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded bg-zinc-950 text-white font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span className="text-zinc-700 leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
