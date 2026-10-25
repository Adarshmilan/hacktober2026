"use client";

import React from "react";
import {
  FolderGit2,
  Sparkles,
  Bug,
  GitPullRequest,
  FileText,
  Settings,
  Cpu,
  Compass,
} from "lucide-react";

interface SidebarProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  onOpenSettings: () => void;
  onBackToLanding?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onBackToLanding,
}: SidebarProps) {
  const navItems = [
    {
      id: "map",
      label: "01 Codebase Map",
      tabIndex: 0,
      icon: FolderGit2,
    },
    {
      id: "issues",
      label: "02 Issue Finder",
      tabIndex: 1,
      icon: Sparkles,
    },
    {
      id: "triage",
      label: "03 Multimodal Triage",
      tabIndex: 2,
      icon: Bug,
    },
    {
      id: "pr_builder",
      label: "04 PR Rules & Builder",
      tabIndex: 3,
      icon: GitPullRequest,
    },
    {
      id: "dossier",
      label: "05 Executive Dossier (PDF)",
      tabIndex: 4,
      icon: FileText,
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-zinc-200 flex flex-col justify-between p-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            WORKSPACE EXPLORER
          </span>
          <span className="text-[11px] font-mono text-zinc-400 font-medium">
            v4.0.4
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.tabIndex;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.tabIndex)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Return to Landing Page */}
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-zinc-500" />
              <span>← Back to Overview</span>
            </button>
          )}

          {/* API Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-zinc-500" />
            <span>API Settings</span>
          </button>
        </nav>
      </div>

      {/* Bottom Widget: GEMMA 4 CONTEXT ENGINE */}
      <div className="border border-zinc-200 rounded-lg p-3 bg-zinc-50/50 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-zinc-700" />
            <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-wider font-semibold">
              GEMMA 4 CONTEXT
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
            256K WINDOW
          </span>
        </div>

        {/* Progress bar: Full black track with emerald-green tip */}
        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden flex relative">
          <div className="w-[90%] bg-zinc-900 h-full" />
          <div className="w-[10%] bg-emerald-500 h-full" />
        </div>

        <p className="text-[11px] text-zinc-500 font-mono font-medium leading-tight">
          100% GROUNDED AST
        </p>
      </div>
    </aside>
  );
}
