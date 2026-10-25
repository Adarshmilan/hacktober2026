# GitCompass 404 — Autonomous Open-Source Contributor & Maintainer Intelligence

> **Navigate Any Codebase. Ship Verified Issues & PRs in Seconds.**  
> Powered by **Local Google Gemma 4 (`gemma4:e2b` via Ollama)** locally on your PC, with optional Google Cloud Gemini API fallback.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-black.svg)](https://www.typescriptlang.org/)
[![Local Gemma 4](https://img.shields.io/badge/Ollama_Local-gemma4%3Ae2b-emerald.svg)](https://ollama.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-black.svg)](https://tailwindcss.com/)

---

## 🎯 Overview

Contributors get overwhelmed by massive 50,000-file codebases with zero idea where execution begins. Maintainers drown in incomplete bug reports and malformed pull requests that fail merge rules.

**GitCompass 404** bridges both sides of open-source engineering using **Local Gemma 4 (`gemma4:e2b` via Ollama)** running 100% locally on your machine. It provides a unified, dual-surface platform:
1. **Dark Obsidian Animated Landing Page (`#070708` / `#0F0F12`)**: High-impact command bar, live telemetry previews, dual persona comparison, and interactive Bento grid.
2. **Light Architectural Workspace (`#FFFFFF` / `#FAFAFA`)**: Hairline 1px borders, carbon black controls, step-by-step monochrome telemetry stream, and 5 specialized engineering workflows.

---

## ⚡ The Five Core Workflows

| Workflow | Inputs | Intelligence Engine | Output & Actions |
|---|---|---|---|
| **01. Repo Explainer & Architecture Map** | GitHub Repo URL | Analyzes `README.md` + recursive file tree to decode subsystem architecture. | Structural directory map, top 3 beginner-friendly entry files with direct clickable links, Visual Architecture Map, and 60s quickstart copy commands. |
| **02. Good-First-Issue Finder & Gem Scorer** | GitHub Repo URL | Ranks open issues by cognitive load, clarity (0-100%), and detects **Unlabeled Beginner Gems**. | Plain-language overviews, suspected file pills, 3-step action plan, and direct `Open Issue on GitHub ↗` links. |
| **03. Screenshot → Bug Report [Multimodal Flagship]** | Error Screenshot (PNG/JPG/WebP or `Ctrl+V` Paste) + Context | Reads callstacks & visual errors via **Gemma 4 Multimodal Vision (Local Ollama)** and correlates them with the repo's file tree. | Correlated File AST Map (confidence % + line range), structured GitHub Issue Markdown, and 1-click **`Create Issue on GitHub ↗`** prefilled URL. |
| **04. PR Description & Merge-Gate Helper** | Git Diff / Patch | Audits diff against repository's `CONTRIBUTING.md` and PR templates. | Merge-gate compliance checklist (Conventional Commits, linked issue, test plan), PR markdown, and **`Compare & Open PR ↗`** button. |
| **05. Executive Dossier & PDF Export** | Full Workspace State | Synthesizes repository health, visual architecture, issue triage, and PR draft into an executive report. | Real-time printable/downloadable PDF report with clean typography and complete repository diagnostic summary. |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph UI ["Client Surface (Next.js 16 + React 19)"]
        Landing["Dark Obsidian Landing Page<br/>(Hero Command Bar + Bento Grid)"]
        Workspace["Light Architectural Workspace<br/>(Telemetry Strip + 5 Tabs)"]
        Settings["API Settings Drawer<br/>(Ollama Status + Model Engine Selector)"]
    end

    subgraph API ["Next.js Backend API Routes"]
        RepoRoute["/api/analyze-repo · Ingestion"]
        BugRoute["/api/screenshot-to-bug · Multimodal"]
        PRRoute["/api/pr-helper · Merge Gate"]
        ModelRoute["/api/models · Gemma Models"]
    end

    subgraph LocalEngine ["Local Offline Intelligence (Default)"]
        OllamaLocal["Local Ollama (`http://localhost:11434`)<br/>gemma4:e2b (Vision + Text + Tools)"]
    end

    subgraph CloudEngine ["Cloud Fallback (Optional)"]
        GeminiCloud["Google GenAI Cloud API<br/>gemma-4-26b-a4b-it / gemini-2.5-flash"]
    end

    subgraph External ["External Services"]
        GHClient["GitHub REST API<br/>(Live Repo Ingestion + Tree Filter)"]
    end

    Landing -->|Repo URL / Bento Deep Link| Workspace
    Landing -.->|Runtime Config| Settings
    Workspace -.->|Runtime Config| Settings

    Workspace --> RepoRoute
    Workspace --> BugRoute
    Workspace --> PRRoute

    RepoRoute --> GHClient
    RepoRoute --> OllamaLocal
    BugRoute --> OllamaLocal
    PRRoute --> OllamaLocal
    ModelRoute --> OllamaLocal

    OllamaLocal -.->|Fallback if Offline| GeminiCloud
```

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- **Node.js**: `v20.9.0` or newer
- **Ollama**: Installed locally with `gemma4:e2b` pulled:
  ```bash
  ollama pull gemma4:e2b
  ```

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/git-compass-404.git
cd git-compass-404

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> [!TIP]
> **Zero API Keys Required**: Since you have Ollama running locally with `gemma4:e2b`, all analysis, visual multimodal screenshot triage, and PR generation run 100% offline on your machine with zero setup.

---

## 🧪 Verification & Build Checks

To verify type safety and build health:
```bash
# TypeScript strict typecheck
npm run typecheck

# Production build bundle
npm run build
```

---

## 🛡️ Security & Privacy Guardrails

- **Zero Arbitrary Execution**: Server calls strictly query `https://api.github.com` with segment encoding and SSRF protection.
- **Client Credential Isolation**: Runtime API keys supplied in the settings modal are persisted only in the user's browser `localStorage` and sent over HTTPS/local loopback to the API routes.
- **Grounded Verification**: All file references returned by Gemma 4 are verified against the real repository tree paths to prevent hallucinations.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
