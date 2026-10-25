"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  FileCode2,
  Code2,
  ArrowRight,
  ImageIcon,
  Sparkles,
  Terminal,
} from "lucide-react";
import { BugReportDraft, RepoMetadata } from "@/types";

interface BugReportTabProps {
  report: BugReportDraft;
  setReport: React.Dispatch<React.SetStateAction<BugReportDraft>>;
  metadata: RepoMetadata;
  onRerun: (contextOverride?: string, imageBase64?: string) => Promise<void>;
  isProcessing: boolean;
}

export function BugReportTab({
  report,
  setReport,
  metadata,
  onRerun,
  isProcessing,
}: BugReportTabProps) {
  const [copied, setCopied] = useState(false);
  const [userUploadedImage, setUserUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [manualTraceInput, setManualTraceInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUserUploadedImage(base64);
      setReport((prev) => ({
        ...prev,
        screenshotName: file.name,
      }));
      onRerun(report.reproducerContext, base64);
    };
    reader.readAsDataURL(file);
  };

  // Clipboard paste listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [report.reproducerContext]);

  const handleCopyMarkdown = () => {
    const markdown = `# ${report.issueTitle}

### 1. Summary & Visual Evidence
${report.summaryEvidence.text} (\`${report.screenshotName}\` showing \`${report.errorType}\`).

Callstack:
\`\`\`
${report.callstack.join("\n")}
\`\`\`

Reproducer context:
> ${report.reproducerContext}

### 2. Steps to Reproduce
${report.stepsToReproduce.map((s, idx) => `${idx + 1}. ${s}`).join("\n")}

### 3. Expected vs. Actual Behavior
**Expected Behavior:**
${report.expectedBehavior}

**Actual Behavior:**
${report.actualBehavior}

### Correlated Suspected Culprits
${report.correlatedNodes
  .map(
    (n) =>
      `- \`${n.filePath}\` (${n.badgeLabel}): ${n.description}`
  )
  .join("\n")}
`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenGitHubIssue = () => {
    const title = encodeURIComponent(report.issueTitle);
    const body = encodeURIComponent(`### 1. Summary & Visual Evidence
${report.summaryEvidence.text} (\`${report.screenshotName}\` showing \`${report.errorType}\`).

\`\`\`
${report.callstack.join("\n")}
\`\`\`

**Reproducer Context:**
> ${report.reproducerContext}

### 2. Steps to Reproduce
${report.stepsToReproduce.map((s, idx) => `${idx + 1}. ${s}`).join("\n")}

### 3. Expected vs. Actual Behavior
**Expected:** ${report.expectedBehavior}
**Actual:** ${report.actualBehavior}

### Correlated Culprits
${report.correlatedNodes
  .map((n) => `- \`${n.filePath}\`: ${n.description}`)
  .join("\n")}
`);

    const url = `https://github.com/${metadata.owner}/${metadata.repo}/issues/new?title=${title}&body=${body}`;
    window.open(url, "_blank");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLoadSampleErrorTrace = () => {
    setReport({
      issueTitle: `[Bug]: Uncaught Runtime Exception in ${metadata.repo} component lifecycle`,
      screenshotName: "terminal-runtime-error.png",
      resolution: "1920 × 1080px",
      ocrConfidence: "100% OCR CONFIDENCE",
      ocrStatus: "Optical Character & Callstack Ingestion Complete",
      errorType: "RuntimeError",
      errorMessage: `Failed to resolve module export in ${metadata.repo}`,
      callstack: [
        `at dispatchAction (${metadata.repo}/src/client.ts:84:12)`,
        `at renderWithHooks (react-dom.production.min.js:142)`,
        `at updateFunctionComponent (react-dom.production.min.js:168)`,
      ],
      reproducerContext: `Invoked primary interaction hook in ${metadata.repo} without optional configuration params.`,
      targetTemplate: "Target: issue-template.md",
      summaryEvidence: {
        text: `During local execution of ${metadata.owner}/${metadata.repo}, an unhandled runtime rejection occurred. Visual OCR identified the following critical callstack:`,
        codePills: [metadata.repo, "RuntimeError", "dispatchAction", "client.ts"],
      },
      stepsToReproduce: [
        `Clone ${metadata.url} and install dependencies.`,
        "Start local development server and navigate to main viewport.",
        "Trigger the active handler without optional environment payload.",
      ],
      expectedBehavior: `The module should validate presence of required parameters, gracefully fall back to safe defaults, and report an accessible warning.`,
      actualBehavior: `Uncaught runtime breakdown leading to unmounted component boundary.`,
      correlatedNodes: [
        {
          filePath: `packages/${metadata.repo}/src/index.ts`,
          matchScore: 96,
          badgeLabel: "96% Match · Suspected Culprit",
          badgeVariant: "crimson",
          description: "Contains root dispatcher without null-guard validation on options argument.",
          lineRange: "L80-L92",
          functionName: "dispatchAction",
        },
      ],
    });
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-8 max-w-[1440px] mx-auto w-full">
      {/* Hidden file input for screenshot upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* LEFT COLUMN: Multimodal Ingestion & Correlated AST Map */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        {/* Card 1: Multimodal Visual Triage */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base text-zinc-950">
                Multimodal Visual Triage
              </h3>
              <p className="text-[10px] font-mono text-zinc-400 font-medium tracking-tight">
                GEMMA 4 VISION SUBSYSTEM · AST CORRELATED
              </p>
            </div>
            <span className="bg-zinc-100 text-zinc-700 text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 font-semibold">
              AST v2.1
            </span>
          </div>

          {/* Screenshot Dropzone & Console Preview Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`space-y-0 overflow-hidden rounded-lg border transition-all shadow-2xs ${
              isDragging ? "border-amber-500 ring-2 ring-amber-500/30" : "border-zinc-200"
            }`}
          >
            {/* Top bar of preview box */}
            <div className="bg-zinc-50 border-b border-zinc-200 px-3 py-1.5 text-[11px] font-mono text-zinc-500 flex justify-between items-center">
              <div className="flex items-center gap-1.5 font-medium">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>{report.screenshotName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400">{report.resolution}</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] text-zinc-600 hover:text-zinc-950 underline font-sans cursor-pointer"
                >
                  Upload Image
                </button>
              </div>
            </div>

            {/* If user uploaded an image, show real preview */}
            {userUploadedImage ? (
              <div className="relative bg-zinc-950 p-2 max-h-52 overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={userUploadedImage}
                  alt="Uploaded error trace"
                  className="max-h-48 object-contain rounded"
                />
              </div>
            ) : (
              /* Live Terminal View reflecting dynamic report data */
              <div className="bg-zinc-950 text-zinc-300 p-4 font-mono text-xs space-y-2 leading-relaxed">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="ml-2 text-[10px] text-zinc-400">
                      Chromium Console / Terminal Exception
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-red-950/80 text-red-400 border border-red-800/60 px-1.5 py-0.2 rounded font-semibold tracking-wider">
                    UNCAUGHT
                  </span>
                </div>

                {/* Dynamic error type & message */}
                <div>
                  <span className="bg-red-950/80 text-red-200 px-1.5 py-0.5 rounded font-semibold inline-block border border-red-900/50">
                    {report.errorType}: {report.errorMessage}
                  </span>
                </div>

                {/* Dynamic Callstack mapping */}
                <div className="text-zinc-400 space-y-0.5 text-[11px] pt-0.5">
                  {report.callstack.map((frame, idx) => (
                    <div key={idx} className="font-mono text-zinc-400">
                      {frame}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom status bar of preview box */}
            <div className="bg-zinc-50 border-t border-zinc-200 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{report.ocrStatus}</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400 font-medium">
                {report.ocrConfidence}
              </span>
            </div>
          </div>

          {/* Quick upload or sample actions */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-700 hover:text-zinc-950 font-medium flex items-center gap-1.5 underline cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Drop Image or Browse Files</span>
            </button>
            <button
              type="button"
              onClick={handleLoadSampleErrorTrace}
              className="text-zinc-500 hover:text-zinc-800 text-[11px] font-mono cursor-pointer"
            >
              Load Test Trace Fixture
            </button>
          </div>

          {/* Observed Reproducer Context */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 block">
              Observed Reproducer Context
            </label>
            <textarea
              rows={3}
              value={report.reproducerContext}
              onChange={(e) =>
                setReport((prev) => ({
                  ...prev,
                  reproducerContext: e.target.value,
                }))
              }
              className="w-full text-xs font-mono bg-zinc-50/70 border border-zinc-200 rounded-lg p-2.5 text-zinc-800 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all resize-none shadow-2xs leading-relaxed"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onRerun(report.reproducerContext, userUploadedImage || undefined)}
              className="border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-medium px-3.5 py-2 rounded-md flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-zinc-700 ${
                  isProcessing ? "animate-spin" : ""
                }`}
              />
              <span>
                {isProcessing ? "Analyzing..." : "↻ Run Gemma 4 Multimodal Triage"}
              </span>
            </button>
            <span className="text-[11px] font-mono text-zinc-400">
              {report.targetTemplate}
            </span>
          </div>
        </div>

        {/* Card 2: Correlated File AST Map */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base text-zinc-950">
                Correlated File AST Map
              </h3>
              <p className="text-[10px] font-mono text-zinc-400 font-medium tracking-tight">
                Grounded to active repository file tree
              </p>
            </div>
            <span className="bg-zinc-100 text-zinc-700 text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 font-semibold">
              {report.correlatedNodes.length} nodes matched
            </span>
          </div>

          <div className="space-y-3">
            {report.correlatedNodes.map((node, i) => (
              <div
                key={i}
                className="border border-zinc-200 rounded-lg p-3.5 bg-zinc-50/40 space-y-2 hover:bg-zinc-50 transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-900">
                    <FileCode2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{node.filePath}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                      node.badgeVariant === "crimson"
                        ? "bg-red-50 text-red-700 border-red-200 font-semibold"
                        : "bg-zinc-100 text-zinc-700 border-zinc-200"
                    }`}
                  >
                    {node.badgeLabel}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  {node.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: STRUCTURED BUG REPORT DRAFT */}
      <div className="col-span-12 lg:col-span-7">
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-6">
          {/* Top bar */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                STRUCTURED BUG REPORT DRAFT
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                ✓ Validated Against Repo Tree
              </span>
            </div>

            {/* Action buttons row */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium px-3.5 py-2 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">✓ Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenGitHubIssue}
                className="bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-medium px-4 py-2 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Create Issue on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
              </button>
            </div>
          </div>

          {/* Editable Issue Title Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
              ISSUE TITLE
            </label>
            <input
              type="text"
              value={report.issueTitle}
              onChange={(e) =>
                setReport((prev) => ({ ...prev, issueTitle: e.target.value }))
              }
              className="w-full text-sm font-semibold text-zinc-950 bg-zinc-50/70 border border-zinc-200 rounded-lg px-3.5 py-2 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all shadow-2xs font-mono"
            />
          </div>

          {/* Section 1: SUMMARY & VISUAL EVIDENCE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase text-zinc-700">
                ### 1. SUMMARY &amp; VISUAL EVIDENCE
              </h4>
              <span className="text-[10px] font-mono text-zinc-400">
                Gemma 4 Multimodal Analysis
              </span>
            </div>

            <div className="bg-zinc-50/70 border border-zinc-200 rounded-lg p-3.5 text-xs text-zinc-700 leading-relaxed space-y-2 font-sans">
              <p>{report.summaryEvidence.text}</p>
              {report.summaryEvidence.codePills && report.summaryEvidence.codePills.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 font-mono">
                  {report.summaryEvidence.codePills.map((pill, pIdx) => (
                    <span
                      key={pIdx}
                      className="bg-zinc-200/80 text-zinc-900 border border-zinc-300/60 px-1.5 py-0.5 rounded text-[11px] font-medium"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: STEPS TO REPRODUCE */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase text-zinc-700">
              ### 2. STEPS TO REPRODUCE
            </h4>

            <div className="space-y-2">
              {report.stepsToReproduce.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 flex items-center gap-3 shadow-2xs"
                >
                  <div className="w-6 h-6 bg-zinc-950 text-white font-mono text-xs flex items-center justify-center rounded shrink-0 font-bold shadow-2xs">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-zinc-800 font-medium leading-normal">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: EXPECTED VS. ACTUAL BEHAVIOR */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase text-zinc-700">
              ### 3. EXPECTED VS. ACTUAL BEHAVIOR
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expected */}
              <div className="bg-zinc-50/70 border border-zinc-200 rounded-lg p-4 space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-xs font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>EXPECTED BEHAVIOR</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                  {report.expectedBehavior}
                </p>
              </div>

              {/* Actual */}
              <div className="bg-red-50/30 border border-red-200 rounded-lg p-4 space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-red-700 font-mono text-xs font-bold">
                  <span>✕ ACTUAL BEHAVIOR</span>
                </div>
                <p className="text-xs text-zinc-800 leading-relaxed font-sans">
                  {report.actualBehavior}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
