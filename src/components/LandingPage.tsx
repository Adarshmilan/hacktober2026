"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  ArrowRight,
  ExternalLink,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Bug,
  GitPullRequest,
  ShieldCheck,
  CheckCircle2,
  FileCode2,
  Check,
  Copy,
  ChevronRight,
  Zap,
  Search,
  ScanEye,
  GitCommit,
  GitFork,
  ArrowUpRight,
  AlertTriangle,
  FolderTree,
} from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface LandingPageProps {
  onLaunchWorkspace: (targetRepo?: string, initialTab?: number) => void;
  onOpenSettings: () => void;
}

export function LandingPage({
  onLaunchWorkspace,
  onOpenSettings,
}: LandingPageProps) {
  const [heroRepoInput, setHeroRepoInput] = useState("https://github.com/vercel/next.js");
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [personaTab, setPersonaTab] = useState<"contributors" | "maintainers">("contributors");
  const [copiedQuickstart, setCopiedQuickstart] = useState(false);

  // Auto-playing 3-step loop every 4 seconds in the Hero showcase
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulationStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunchWorkspace(heroRepoInput.trim() || "https://github.com/vercel/next.js", 2);
  };

  const sampleRepos = [
    { name: "vercel/next.js", url: "https://github.com/vercel/next.js", stars: "128k" },
    { name: "facebook/react", url: "https://github.com/facebook/react", stars: "228k" },
    { name: "calcom/cal.com", url: "https://github.com/calcom/cal.com", stars: "34k" },
    { name: "tailwindlabs/tailwindcss", url: "https://github.com/tailwindlabs/tailwindcss", stars: "82k" },
    { name: "supabase/supabase", url: "https://github.com/supabase/supabase", stars: "76k" },
  ];

  const handleCopyCmd = () => {
    navigator.clipboard.writeText("git clone https://github.com/vercel/next.js.git && pnpm install");
    setCopiedQuickstart(true);
    setTimeout(() => setCopiedQuickstart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-zinc-50 relative overflow-x-hidden">
      {/* Subtle Architectural Dot Mesh Grid Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #52525b 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* SECTION 1: Floating Dark Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#070708]/85 border-b border-zinc-800/80 px-6 py-3.5 transition-all">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-inner">
              <Compass className="w-4 h-4 text-zinc-100" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-base tracking-tight text-zinc-50">
                GitCompass 404
              </span>
              <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded tracking-wide font-medium">
                OPEN-WEIGHT AI ENGINE
              </span>
            </div>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#overview" className="hover:text-zinc-100 transition-colors">
              Overview
            </a>
            <a href="#workflows" className="hover:text-zinc-100 transition-colors">
              Core Workflows
            </a>
            <a href="#multimodal" className="hover:text-zinc-100 transition-colors">
              Multimodal Triage
            </a>
            <a href="#architecture" className="hover:text-zinc-100 transition-colors">
              Architecture
            </a>
          </div>

          {/* Right Status & Workspace Launch CTA */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden sm:flex items-center gap-2 bg-[#0F0F12] border border-zinc-800 px-3 py-1.5 rounded-full text-xs text-zinc-300 hover:border-zinc-700 transition cursor-pointer"
              title="Configure Google Gemma 4 Model and API Settings"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[11px] font-mono">Google Gemma 4 · Active</span>
            </button>

            <button
              type="button"
              onClick={() => onLaunchWorkspace(heroRepoInput.trim() || "https://github.com/vercel/next.js")}
              className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-2 rounded-md text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 2: High-Impact Hero Section + Live Repo Command Bar */}
      <section id="overview" className="pt-20 pb-16 px-6 max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Top Telemetry Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-xs font-mono px-4 py-1.5 rounded-full flex items-center gap-2 shadow-inner"
          >
            <span className="text-amber-400">⚡</span>
            <span>CODEBASE ONBOARDING & MULTIMODAL ISSUE TRIAGE · POWERED BY GOOGLE GEMMA 4</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-50 leading-[1.08]"
          >
            Navigate Any Codebase.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500">
              Ship Verified Issues & PRs in Seconds.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base md:text-lg max-w-2xl leading-relaxed"
          >
            Contributors get lost in massive repositories. Maintainers drown in vague bug reports.
            GitCompass 404 uses Google Gemma 4 (Text + Vision) to map repository architecture, rank
            beginner-ready issues, turn error screenshots into codebase-linked bug reports, and audit
            pull requests against project rules.
          </motion.p>

          {/* Centerpiece Repo Command Launcher */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-2xl pt-2"
          >
            <form
              onSubmit={handleHeroSubmit}
              className="bg-[#0F0F12] border border-zinc-700 focus-within:border-zinc-400 rounded-xl p-2 flex items-center shadow-2xl transition-all"
            >
              <GithubIcon className="w-5 h-5 text-zinc-400 ml-3 mr-3 shrink-0" />
              <input
                type="text"
                value={heroRepoInput}
                onChange={(e) => setHeroRepoInput(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full bg-transparent text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-5 py-3 rounded-lg text-xs md:text-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
              >
                <span>Analyze Repository</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick-Launch Sample Chips */}
            <div className="flex items-center justify-center flex-wrap gap-2 pt-3 text-xs text-zinc-500 font-mono">
              <span className="text-zinc-600">Try Live Repositories:</span>
              {sampleRepos.map((repo) => (
                <button
                  key={repo.name}
                  type="button"
                  onClick={() => {
                    setHeroRepoInput(repo.url);
                    onLaunchWorkspace(repo.url, 2);
                  }}
                  className="bg-[#141418] hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
                >
                  <span>{repo.name}</span>
                  <span className="text-[10px] text-zinc-500">★{repo.stars}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Hero Visual Showcase: Live Dual-Pane Multimodal Simulation Window */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 bg-[#0F0F12] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto"
        >
          {/* Top Window Bar */}
          <div className="bg-[#141418] border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-zinc-400 ml-3">
                gitcompass-telemetry — vercel/next.js — gemma-4-26b-a4b-it
              </span>
            </div>

            {/* Live Step Indicator Bar */}
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setSimulationStep(0)}
                className={`px-2.5 py-0.5 rounded transition ${
                  simulationStep === 0
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                01. Ingest Repo
              </button>
              <span className="text-zinc-600">→</span>
              <button
                type="button"
                onClick={() => setSimulationStep(1)}
                className={`px-2.5 py-0.5 rounded transition ${
                  simulationStep === 1
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                02. Gemma 4 Vision OCR
              </button>
              <span className="text-zinc-600">→</span>
              <button
                type="button"
                onClick={() => setSimulationStep(2)}
                className={`px-2.5 py-0.5 rounded transition ${
                  simulationStep === 2
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                03. Verified Issue
              </button>
            </div>
          </div>

          {/* Interactive Dual-Pane Terminal Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-800 p-6 gap-6 font-mono text-xs">
            {/* Left Pane: Ingestion & OCR */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center justify-between text-zinc-400 pb-2 border-b border-zinc-800/80">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                  Visual Triage Ingestion
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  100% OCR GROUNDED
                </span>
              </div>

              {/* Console preview frame */}
              <div className="bg-[#070708] border border-zinc-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-1 border-b border-zinc-900">
                  <span>console-error-trace.png (1240 × 820px)</span>
                  <span className="text-red-400 text-[10px] bg-red-950/60 border border-red-800/50 px-1.5 py-0.2 rounded">
                    UNCAUGHT
                  </span>
                </div>

                <div className="bg-red-950/50 border border-red-900/60 text-red-300 px-2 py-1 rounded text-xs font-semibold">
                  TypeError: Cannot read properties of undefined (reading &apos;items&apos;)
                </div>

                <div className="text-zinc-500 text-[11px] space-y-0.5 pt-1">
                  <div>
                    at CheckoutForm (
                    <span className="text-zinc-300 underline decoration-zinc-600">
                      CheckoutForm.tsx:42:18
                    </span>
                    )
                  </div>
                  <div>at renderWithHooks (react-dom.development.js:15486)</div>
                  <div>at updateFunctionComponent (react-dom.development.js:19588)</div>
                </div>
              </div>

              {/* AST Match Callout */}
              <div
                className={`p-3 rounded-lg border transition-all ${
                  simulationStep >= 1
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                    : "bg-zinc-900/40 border-zinc-800/80 text-zinc-500"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span>AST Correlated Culprit File:</span>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded text-[10px]">
                    94% AST Match
                  </span>
                </div>
                <div className="font-mono text-xs mt-1 text-zinc-200">
                  src/components/checkout/CheckoutForm.tsx
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Node `handleSubmission` lacks defensive guard for `cart.items`.
                </div>
              </div>
            </div>

            {/* Right Pane: Generated GitHub Issue Draft */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center justify-between text-zinc-400 pb-2 border-b border-zinc-800/80">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                  Structured Issue Draft
                </span>
                <span className="text-[10px] text-zinc-400">Target: issue-template.md</span>
              </div>

              <div className="bg-[#070708] border border-zinc-800 rounded-lg p-4 space-y-3">
                <div className="text-[10px] uppercase text-zinc-500 font-bold">Issue Title</div>
                <div className="font-semibold text-zinc-100 text-xs">
                  [Bug]: Unhandled TypeError in CheckoutForm when submitting empty state
                </div>

                <div className="text-[10px] uppercase text-zinc-500 font-bold pt-1">
                  Steps to Reproduce
                </div>
                <div className="space-y-1.5 text-[11px] text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold">
                      1
                    </span>
                    <span>Navigate to /checkout with empty session storage.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold">
                      2
                    </span>
                    <span>Click primary &apos;Confirm &amp; Pay&apos; trigger without item selection.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold">
                      3
                    </span>
                    <span>Observe unhandled runtime rejection and white screen.</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready for 1-Click Publishing</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onLaunchWorkspace(heroRepoInput.trim() || "https://github.com/vercel/next.js", 2)}
                    className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-3 py-1.5 rounded text-[11px] flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>Inspect in Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3: Solving Both Sides of Open Source (Interactive Switcher) */}
      <section className="py-20 px-6 max-w-[1300px] mx-auto border-t border-zinc-800/60 relative z-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider font-semibold">
            THE OPEN-SOURCE COLLABORATION GAP
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">
            Engineered for Both Sides of the Repo
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            Contributors want fast orientation and clear issues. Maintainers need reproducible reports
            and compliant pull requests.
          </p>

          {/* Segmented Toggle Switch */}
          <div className="inline-flex p-1 rounded-xl bg-[#0F0F12] border border-zinc-800 mt-4">
            <button
              type="button"
              onClick={() => setPersonaTab("contributors")}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                personaTab === "contributors"
                  ? "bg-zinc-100 text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              👨‍💻 For Contributors &amp; Newcomers
            </button>
            <button
              type="button"
              onClick={() => setPersonaTab("maintainers")}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                personaTab === "maintainers"
                  ? "bg-zinc-100 text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🛡️ For Repository Maintainers
            </button>
          </div>
        </div>

        {/* Dynamic Comparison Grid */}
        <AnimatePresence mode="wait">
          {personaTab === "contributors" ? (
            <motion.div
              key="contributors"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Friction Card */}
              <div className="bg-[#0F0F12] border border-zinc-800 rounded-2xl p-7 space-y-4">
                <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>THE CONTRIBUTOR FRICTION</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-100">
                  Getting Lost in Massive 50,000-File Monorepos
                </h3>
                <ul className="space-y-3 text-xs text-zinc-400 font-sans leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Opening a project with 40 packages and no idea where entry-point execution starts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Filtering open issues and finding stale bug reports with incomplete explanations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Fear of getting PRs rejected due to undocumented conventions in CONTRIBUTING.md.</span>
                  </li>
                </ul>
              </div>

              {/* Solution Card */}
              <div className="bg-[#0F0F12] border border-zinc-700/80 rounded-2xl p-7 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>THE GITCOMPASS 404 ADVANTAGE</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-100">
                  Instant Plain-English Codebase Navigation
                </h3>
                <ul className="space-y-3 text-xs text-zinc-300 font-sans leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>Instant plain-English directory maps and the top 3 lowest-cognitive-load files to start.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>AI-ranked beginner issues with exact file pointers, clarity scores, and 3-step starters.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>Automated PR description generation strictly tailored to repository merge rules.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="maintainers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Friction Card */}
              <div className="bg-[#0F0F12] border border-zinc-800 rounded-2xl p-7 space-y-4">
                <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>THE MAINTAINER BURNOUT</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-100">
                  Vague Bug Reports &amp; Unformatted Pull Requests
                </h3>
                <ul className="space-y-3 text-xs text-zinc-400 font-sans leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Receiving cropped screenshots with zero context or reproduction steps.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Spending 40% of triage time asking users for reproduction steps and OS versions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Reviewing PRs that ignore commit message conventions or lack verification notes.</span>
                  </li>
                </ul>
              </div>

              {/* Solution Card */}
              <div className="bg-[#0F0F12] border border-zinc-700/80 rounded-2xl p-7 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>THE GITCOMPASS 404 ADVANTAGE</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-100">
                  AST-Correlated Triage &amp; 100% Rule Compliance
                </h3>
                <ul className="space-y-3 text-xs text-zinc-300 font-sans leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>Gemma 4 Multimodal Vision turns error images into verified, structured issue templates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>Stack traces are correlated to exact AST file paths with confidence ratings.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>Automated CONTRIBUTING.md checklist verifies Conventional Commits and issue linkage.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION 4: The 4-Feature Animated Bento Grid */}
      <section id="workflows" className="py-20 px-6 max-w-[1400px] mx-auto border-t border-zinc-800/60 relative z-10">
        <div className="space-y-3 mb-12 text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider font-semibold">
            CORE PLATFORM CAPABILITIES
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">
            One Repository URL. Five Complete Workflows.
          </h2>
          <p className="text-zinc-400 text-sm">
            Click any workflow card below to launch the live interactive workspace instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* BENTO CARD 01: Repo Explainer & Map (Span 7) */}
          <div
            onClick={() => onLaunchWorkspace(heroRepoInput.trim() || "https://github.com/vercel/next.js", 0)}
            className="md:col-span-7 bg-[#0F0F12] hover:bg-[#141418] border border-zinc-800 hover:border-zinc-600 rounded-2xl p-7 transition-all duration-300 group cursor-pointer shadow-lg hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  README + FILE TREE INGESTION
                </span>
                <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-200 transition-colors flex items-center gap-1">
                  <span>Open Tab 01</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-50">
                01 · Repo Explainer &amp; Architecture Map
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Reads the README.md, directory tree, and key entry files to produce a structured
                architecture guide, local setup commands, and the exact files a developer should
                inspect first.
              </p>
            </div>

            {/* Interactive Architecture Map Graphic */}
            <div className="mt-6 bg-[#070708] border border-zinc-800/80 rounded-xl p-4 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pb-2 border-b border-zinc-900">
                <span>Directory Flow Nodes</span>
                <span className="text-emerald-400">● Live Pipeline</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-zinc-900/80 border border-zinc-800 p-2 rounded">
                  <div className="text-[9px] text-zinc-500">PACKAGES</div>
                  <div className="font-semibold text-zinc-200 mt-0.5">packages/core</div>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-2 rounded">
                  <div className="text-[9px] text-zinc-500">ENGINE</div>
                  <div className="font-semibold text-zinc-200 mt-0.5">src/runtime</div>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-2 rounded">
                  <div className="text-[9px] text-zinc-500">SUITES</div>
                  <div className="font-semibold text-zinc-200 mt-0.5">test/e2e</div>
                </div>
              </div>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-900 flex items-center justify-between text-[11px] text-zinc-400">
                <code>$ pnpm install &amp;&amp; pnpm dev</code>
                <span className="text-[10px] text-zinc-500 font-sans">60s Quickstart</span>
              </div>
            </div>
          </div>

          {/* BENTO CARD 02: Good-First-Issue Finder (Span 5) */}
          <div
            onClick={() => onLaunchWorkspace(heroRepoInput.trim() || "https://github.com/vercel/next.js", 1)}
            className="md:col-span-5 bg-[#0F0F12] hover:bg-[#141418] border border-zinc-800 hover:border-zinc-600 rounded-2xl p-7 transition-all duration-300 group cursor-pointer shadow-lg hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  DIFFICULTY &amp; CLARITY RANKING
                </span>
                <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-200 transition-colors flex items-center gap-1">
                  <span>Open Tab 02</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-50">
                02 · Smart &quot;Good First Issue&quot; Finder
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pulls open issues via GitHub API and ranks them by difficulty (1/5 to 5/5) and
                clarity—identifying hidden beginner gems maintainers forgot to label.
              </p>
            </div>

            {/* Stacked Issue Cards Graphic */}
            <div className="mt-6 space-y-2 font-mono text-xs">
              <div className="bg-[#070708] border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 text-[10px]">#64120</span>
                  <div className="font-semibold text-zinc-200 text-[11px]">Fix anchor link in docs</div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded">
                  1/5 Beginner
                </span>
              </div>
              <div className="bg-[#070708] border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 text-[10px]">#63984</span>
                  <div className="font-semibold text-zinc-200 text-[11px]">Missing prop warning</div>
                </div>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded">
                  ★ Unlabeled Gem
                </span>
              </div>
            </div>
          </div>

          {/* BENTO CARD 03: Multimodal Vision Triage (Span 7 — Warm Amber Highlight) */}
          <div
            id="multimodal"
            onClick={() => onLaunchWorkspace(heroRepoInput.trim() || "https://github.com/vercel/next.js", 2)}
            className="md:col-span-7 bg-[#0F0F12] hover:bg-[#141418] border border-amber-500/40 hover:border-amber-500/80 rounded-2xl p-7 transition-all duration-300 group cursor-pointer shadow-xl hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  GEMMA 4 IMAGE UNDERSTANDING + AST CORRELATION
                </span>
                <span className="text-xs font-mono text-amber-400 group-hover:text-amber-300 transition-colors flex items-center gap-1 font-semibold">
                  <span>Featured Workflow ↗</span>
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-50">
                03 · Screenshot to Bug Report [Multimodal Vision]
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Upload a screenshot of an error, broken UI, or console trace. Gemma 4 reads the
                image, correlates the error with the repository file tree, and drafts a structured
                GitHub issue with reproduction steps and culprit files.
              </p>
            </div>

            {/* Split Visual Preview Graphic */}
            <div className="mt-6 grid grid-cols-2 gap-3 font-mono text-xs relative z-10">
              <div className="bg-[#070708] border border-zinc-800 p-3 rounded-lg space-y-1.5">
                <span className="text-[10px] text-zinc-500 uppercase">Input Screenshot</span>
                <div className="text-red-400 font-semibold text-[11px] truncate">
                  Uncaught Exception: null check
                </div>
                <div className="text-[10px] text-zinc-500">at src/client.ts:84:12</div>
              </div>
              <div className="bg-[#070708] border border-emerald-950 p-3 rounded-lg space-y-1.5">
                <span className="text-[10px] text-emerald-400 uppercase">AST Grounded Issue</span>
                <div className="text-zinc-200 font-semibold text-[11px] truncate">
                  [Bug]: Correlated AST Culprit
                </div>
                <div className="text-[10px] text-emerald-400 font-sans">✓ Ready to copy or publish</div>
              </div>
            </div>
          </div>

          {/* BENTO CARD 04: PR Description & Rules Helper (Span 5) */}
          <div
            onClick={() => onLaunchWorkspace(heroRepoInput.trim() || "https://github.com/vercel/next.js", 3)}
            className="md:col-span-5 bg-[#0F0F12] hover:bg-[#141418] border border-zinc-800 hover:border-zinc-600 rounded-2xl p-7 transition-all duration-300 group cursor-pointer shadow-lg hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  PROJECT STYLE &amp; RULE ALIGNMENT
                </span>
                <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-200 transition-colors flex items-center gap-1">
                  <span>Open Tab 04</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-50">
                04 · PR Description &amp; CONTRIBUTING.md Helper
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Paste a git diff or list of modified files. Gemma 4 reads the project&apos;s
                CONTRIBUTING.md and writes a clean, compliant PR title, summary, and verification
                checklist.
              </p>
            </div>

            {/* Compliance Meter Graphic */}
            <div className="mt-6 bg-[#070708] border border-zinc-800 p-4 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">CONTRIBUTING.md Compliance</span>
                <span className="text-emerald-400 font-bold">100% Passed</span>
              </div>
              <div className="space-y-1 text-[11px] text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conventional Commit Title</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Linked Issue Reference</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Plan Included</span>
                </div>
              </div>
            </div>
          </div>

          {/* BENTO CARD 05: Executive Dossier & PDF Export (Span 12) */}
          <div
            onClick={() => onLaunchWorkspace(heroRepoInput.trim() || "https://github.com/vercel/next.js", 4)}
            className="md:col-span-12 bg-linear-to-r from-[#0F0F12] via-[#121217] to-[#0F0F12] hover:border-zinc-500 border border-zinc-800 rounded-2xl p-7 transition-all duration-300 group cursor-pointer shadow-xl hover:-translate-y-1 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  NEW · EXECUTIVE REPORT ENGINE
                </span>
                <span className="text-xs font-mono text-zinc-400">Tab 05</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-50">
                05 · Executive Dossier &amp; PDF Export
              </h3>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                Export an end-to-end, multi-page intelligence dossier formatted for executive briefing and team onboarding. Includes health metrics, dynamic architecture map, beginner issues triage, bug diagnosis, and PR compliance.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-mono px-3.5 py-2 rounded-lg group-hover:border-zinc-500 transition-colors flex items-center gap-2">
                <span>Export Dossier (PDF / Markdown)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: System Architecture: How GitCompass 404 Works Under the Hood */}
      <section id="architecture" className="py-20 px-6 bg-[#0B0B0E] border-y border-zinc-800/80 relative z-10">
        <div className="max-w-[1300px] mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider font-semibold">
              PIPELINE ARCHITECTURE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">
              How GitCompass 404 Works Under the Hood
            </h2>
            <p className="text-zinc-400 text-sm">
              Four grounded stages ensuring zero hallucinations and direct repository parity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs">
            {/* Stage 1 */}
            <div className="bg-[#0F0F12] border border-zinc-800 p-5 rounded-xl space-y-2.5">
              <span className="text-[10px] text-amber-400 font-bold block">STAGE 01</span>
              <h4 className="font-bold text-sm text-zinc-100">GitHub API Ingestion &amp; Smart Trimming</h4>
              <p className="text-zinc-400 text-[11px] font-sans leading-relaxed">
                Fetches README.md, CONTRIBUTING.md, recursive file trees, and open issues with an
                in-memory Map cache to eliminate rate limit overhead.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="bg-[#0F0F12] border border-zinc-800 p-5 rounded-xl space-y-2.5">
              <span className="text-[10px] text-amber-400 font-bold block">STAGE 02</span>
              <h4 className="font-bold text-sm text-zinc-100">Google Gemma 4 Multimodal Engine</h4>
              <p className="text-zinc-400 text-[11px] font-sans leading-relaxed">
                Processes trimmed repository context + uploaded error screenshots via the Gemini API
                (gemma-4-26b-a4b-it) using the official @google/genai SDK.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="bg-[#0F0F12] border border-zinc-800 p-5 rounded-xl space-y-2.5">
              <span className="text-[10px] text-emerald-400 font-bold block">STAGE 03</span>
              <h4 className="font-bold text-sm text-zinc-100">Source-Grounded Verification</h4>
              <p className="text-zinc-400 text-[11px] font-sans leading-relaxed">
                Enforces strict JSON output schemas where every architectural claim or bug hypothesis
                cites real file paths from the repository tree.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="bg-[#0F0F12] border border-zinc-800 p-5 rounded-xl space-y-2.5">
              <span className="text-[10px] text-emerald-400 font-bold block">STAGE 04</span>
              <h4 className="font-bold text-sm text-zinc-100">Zero-Auth GitHub Deep-Linking</h4>
              <p className="text-zinc-400 text-[11px] font-sans leading-relaxed">
                Generates pre-filled GitHub Issue and Pull Request query URLs so developers can publish
                to GitHub in one click without database or OAuth overhead.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Footer & Instant Workspace Trigger */}
      <footer className="py-20 px-6 max-w-[1300px] mx-auto text-center space-y-8 relative z-10">
        <div className="space-y-4 max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-50">
            Understand any repository and ship better contributions today.
          </h2>
          <p className="text-zinc-400 text-sm">
            Powered by Google Gemma 4. Works with any public GitHub repository out of the box.
          </p>
        </div>

        {/* Dual CTA Buttons */}
        <div className="flex items-center justify-center flex-wrap gap-4 pt-2">
          <button
            type="button"
            onClick={() => onLaunchWorkspace(heroRepoInput.trim() || "https://github.com/vercel/next.js", 2)}
            className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-6 py-3 rounded-lg text-sm transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <span>Launch GitCompass Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onLaunchWorkspace(heroRepoInput.trim() || "https://github.com/vercel/next.js", 2)}
            className="bg-[#0F0F12] hover:bg-zinc-900 text-zinc-200 border border-zinc-700 px-6 py-3 rounded-lg text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Test Multimodal Bug Triage</span>
            <ScanEye className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        <div className="pt-12 border-t border-zinc-900 text-xs font-mono text-zinc-600 flex items-center justify-between flex-wrap gap-4">
          <span>GitCompass 404 · Open-Source Contributor Intelligence</span>
          <span>Powered by Google Gemma 4 (Text + Multimodal Vision) · MIT License</span>
        </div>
      </footer>
    </div>
  );
}
