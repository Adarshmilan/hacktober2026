"use client";

import React, { useState } from "react";
import { Compass, Terminal, Sparkles } from "lucide-react";

interface HeaderProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  onAnalyze: (url?: string) => void;
  isAnalyzing: boolean;
  onOpenSettings: () => void;
  onBackToLanding?: () => void;
}

export function Header({
  repoUrl,
  setRepoUrl,
  onAnalyze,
  isAnalyzing,
  onOpenSettings,
  onBackToLanding,
}: HeaderProps) {
  const [inputValue, setInputValue] = useState(repoUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setRepoUrl(inputValue.trim());
      onAnalyze(inputValue.trim());
    }
  };

  const handleQuickSelect = (url: string) => {
    setInputValue(url);
    setRepoUrl(url);
    onAnalyze(url);
  };

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
      {/* Left Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBackToLanding}
          className="flex items-center gap-3 text-left cursor-pointer hover:opacity-85 transition-opacity"
          title="Return to Dark Landing Page Overview"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-lg tracking-tight text-zinc-950">
              GitCompass 404
            </span>
            <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 font-semibold tracking-wide">
              OPEN-SOURCE ENGINE v4.0
            </span>
          </div>
        </button>
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-[11px] font-mono text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ml-1"
            title="Return to Landing Page Overview"
          >
            <span>← Landing Page</span>
          </button>
        )}
      </div>

      {/* Center Repo Input Bar */}
      <div className="flex items-center gap-3">
        <form
          onSubmit={handleSubmit}
          className="border border-zinc-300 rounded-md pl-3 pr-1 py-1 flex items-center w-[420px] bg-white shadow-2xs focus-within:border-zinc-950 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="w-full text-xs text-zinc-900 bg-transparent focus:outline-none placeholder:text-zinc-400 font-mono"
          />
          <button
            type="submit"
            disabled={isAnalyzing}
            className="bg-zinc-950 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-zinc-800 disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Repo"}
          </button>
        </form>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="text-zinc-400 text-[11px] font-mono">Try:</span>
          <button
            type="button"
            onClick={() => handleQuickSelect("https://github.com/facebook/react")}
            className="text-[11px] font-mono bg-zinc-100 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 px-2 py-0.5 rounded border border-zinc-200 transition-colors cursor-pointer"
          >
            facebook/react
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect("https://github.com/calcom/cal.com")}
            className="text-[11px] font-mono bg-zinc-100 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 px-2 py-0.5 rounded border border-zinc-200 transition-colors cursor-pointer"
          >
            calcom/cal.com
          </button>
        </div>
      </div>

      {/* Right Status & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSettings}
          className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-zinc-700 transition-colors cursor-pointer"
          title="Click to configure Gemini API Key and Gemma model"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-medium text-[11px]">
            Model: Google Gemma 4 (Multimodal) · API Ready
          </span>
        </button>

        <div
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center font-mono text-xs font-semibold cursor-pointer hover:bg-zinc-800 transition-colors shadow-xs"
          title="User Profile & Settings"
        >
          GC
        </div>
      </div>
    </header>
  );
}
