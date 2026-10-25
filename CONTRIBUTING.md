# Contributing to GitCompass 404

Thank you for your interest in contributing to **GitCompass 404** — the Autonomous Open-Source Contributor & Maintainer Intelligence Platform powered by Google Gemma 4 (Text + Multimodal Vision).

We welcome beginner contributors and seasoned maintainers alike.

---

## 1. Quickstart Development Setup

1. **Fork & Clone** the repository:
   ```bash
   git clone https://github.com/<your-username>/git-compass-404.git
   cd git-compass-404
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey).
   *(Note: You can also configure or test keys at runtime via the in-app API Settings drawer).*
4. **Start Local Development**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to inspect both the Dark Landing Page and the Light Dashboard Workspace.

---

## 2. Architecture & Design Principles

- **Dual-Surface Aesthetic**:
  - **Landing Page**: Dark Obsidian Black (`#070708` / `#0F0F12`), Brushed Silver, and subtle Warm Amber/Emerald accents.
  - **Dashboard Workspace**: Crisp White (`#FFFFFF`) & Alabaster (`#FAFAFA`), Carbon Black (`#09090B`) interactive elements, `1px` hairline borders (`#E4E4E7`).
- **Gemma 4 Multimodal Grounding**:
  - All bug report triage must correlate visual error traces against real repository AST file paths.
  - No synthetic hallucinations; cited paths must exist in the GitHub file tree.
- **Zero Broken Imports & Strong Typing**:
  - TypeScript strict mode enabled throughout `src/`.
  - Validate all external JSON payloads.

---

## 3. Pull Request Guidelines

1. **Conventional Commits**: Format commit titles and PR titles according to the standard:
   - `feat(triage): add drag-and-drop file upload for multimodal screenshots`
   - `fix(github): improve rate-limit fallback headers`
   - `docs(readme): add Gemma 4 architecture flow diagram`
2. **Pre-commit Verification**:
   Before submitting your PR, ensure compilation passes cleanly:
   ```bash
   npm run typecheck
   npm run build
   ```
3. **PR Description**:
   Include a clear summary of changes, linked issue references, and a verification plan. (Feel free to use GitCompass 404's own **PR Builder** tab to draft it!).

---

## 4. Code of Conduct

Please treat everyone with respect, kindness, and empathy. Harassment or offensive comments will not be tolerated.

Happy hacking! 🚀
