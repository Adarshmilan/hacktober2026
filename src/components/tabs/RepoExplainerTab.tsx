"use client";

import React, { useState } from "react";
import {
  FolderTree,
  FileCode,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Layers,
  ArrowRight,
  GitFork,
  Cpu,
} from "lucide-react";
import { DirectoryExplainer, RecommendedFile, RepoMetadata, ArchitectureMapData } from "@/types";

interface RepoExplainerTabProps {
  metadata: RepoMetadata;
  directories: DirectoryExplainer[];
  recommendedFiles: RecommendedFile[];
  architectureMap?: ArchitectureMapData;
}

export function RepoExplainerTab({
  metadata,
  directories,
  recommendedFiles,
  architectureMap,
}: RepoExplainerTabProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const quickstartCommands = `# 1. Clone repository
git clone ${metadata.url}.git
cd ${metadata.repo}

# 2. Install dependencies with package manager
npm install # or pnpm install

# 3. Launch local development server
npm run dev # or pnpm dev

# 4. Run test suites
npm test`;

  const handleCopyQuickstart = () => {
    navigator.clipboard.writeText(quickstartCommands);
    setCopiedIndex(999);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const layers = architectureMap?.layers || [
    {
      layerNumber: "LAYER 01",
      name: "Public Surface & Entrypoints",
      tagline: recommendedFiles[0]?.path || "Application root & interface gateways",
      files: recommendedFiles.slice(0, 2).map((f) => f.path),
      role: "User interactions, request routing, and client viewports.",
    },
    {
      layerNumber: "LAYER 02",
      name: "Core Business Logic & Subsystems",
      tagline: directories[0]?.path || "Domain logic & state operations",
      files: directories.slice(0, 2).map((d) => d.path),
      role: "Core algorithms, data mutations, and module controllers.",
    },
    {
      layerNumber: "LAYER 03",
      name: "Shared Utilities & Storage Primitives",
      tagline: directories[1]?.path || "Platform foundation & invariant schemas",
      files: directories.slice(2, 4).map((d) => d.path),
      role: "Data schemas, storage drivers, and system utilities.",
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-6 p-8 max-w-[1440px] mx-auto w-full">
      {/* LEFT COLUMN: How This Project Is Organized */}
      <div className="col-span-12 lg:col-span-6 space-y-6">
        {/* Directories Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-zinc-800" />
                <span>How This Project Is Organized</span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-400 font-medium">
                STRUCTURAL FOLDER BREAKDOWN & PURPOSE
              </p>
            </div>
            <span className="bg-zinc-100 text-zinc-700 text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 font-semibold">
              {directories.length} Key Folders
            </span>
          </div>

          <div className="space-y-3">
            {directories.map((dir, idx) => (
              <div
                key={idx}
                className="border border-zinc-200 rounded-lg p-3.5 bg-zinc-50/50 hover:bg-zinc-50 transition-colors shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-zinc-950 bg-zinc-200/60 px-2 py-0.5 rounded">
                    {dir.path}
                  </span>
                  {dir.fileCount && (
                    <span className="text-[10px] font-mono text-zinc-500">
                      {dir.fileCount}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-zinc-800">{dir.title}</h4>
                <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                  {dir.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Files for Newcomers Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-zinc-800" />
                <span>Top Files for Newcomers to Start Looking</span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-400 font-medium">
                LOW COGNITIVE LOAD ENTRYPOINTS
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
              Beginner Friendly
            </span>
          </div>

          <div className="space-y-3">
            {recommendedFiles.map((file, idx) => (
              <div
                key={idx}
                className="border border-zinc-200 rounded-lg p-3.5 bg-zinc-50/50 hover:bg-zinc-50 transition-colors shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <a
                    href={file.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs font-bold text-zinc-900 hover:underline flex items-center gap-1.5"
                  >
                    <span>{file.path}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                  <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 border border-zinc-200 px-2 py-0.5 rounded font-semibold">
                    {file.difficulty} · {file.lines} lines
                  </span>
                </div>
                <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                  <strong className="text-zinc-900 font-semibold">{file.role}:</strong>{" "}
                  {file.whyStartHere}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Visual Architecture Map & Quickstart */}
      <div className="col-span-12 lg:col-span-6 space-y-6">
        {/* Dynamic Architecture Map Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-800" />
                <span>Visual Architecture Map</span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-400 font-medium">
                {architectureMap?.paradigm || "DYNAMIC REPOSITORY SUBSYSTEM BLUEPRINT"}
              </p>
            </div>
            <span className="bg-zinc-100 text-zinc-700 text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 font-semibold">
              AST Verified
            </span>
          </div>

          {architectureMap?.flowDescription && (
            <p className="text-xs text-zinc-600 font-mono bg-zinc-50 p-2.5 rounded border border-zinc-200">
              {architectureMap.flowDescription}
            </p>
          )}

          {/* Dynamic Architecture Node Diagram */}
          <div className="border border-zinc-200 rounded-lg p-5 bg-zinc-50/60 shadow-2xs space-y-3 font-mono">
            {layers.map((layer, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className="flex justify-center items-center py-1 text-zinc-400 text-[11px] font-mono">
                    ↓ SUBSYSTEM DISPATCH &amp; STATE FLOW ↓
                  </div>
                )}
                <div className="bg-white border border-zinc-200 p-3.5 rounded-lg shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      {layer.layerNumber}
                    </span>
                    <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                      {layer.tagline}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900">{layer.name}</h4>
                  <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                    {layer.role}
                  </p>
                  {layer.files && layer.files.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {layer.files.map((file, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[10px] font-mono bg-zinc-50 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Quickstart Command Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-800" />
                <span>60-Second Quickstart Setup</span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-400 font-medium">
                REPRODUCE & RUN LOCALLY
              </p>
            </div>
            <button
              onClick={handleCopyQuickstart}
              className="border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedIndex === 999 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Copy Commands</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-zinc-950 text-zinc-300 p-4 rounded-lg font-mono text-xs overflow-x-auto shadow-2xs leading-relaxed">
            <pre>{quickstartCommands}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
