# Contributing to GitCompass 404

Thank you for your interest in contributing to **GitCompass 404**! Built with pride by **Team 404 Not Found**, GitCompass 404 is an open-source autonomous intelligence platform designed to empower newcomers and streamline maintainer operations worldwide.

We welcome contributions of all levels — whether fixing typos in documentation, adding new visual architecture diagrams, expanding local model support, or writing unit tests.

---

## 👥 The Core Team

**GitCompass 404** was created and is actively maintained by **Team 404 Not Found**:
- 👑 **Team Leader**: **Parshwa**
- 💻 **Core Engineers**: **Sakshi Sharma**, **Adarsh Milan**, **Abhishek Kumar**

---

## 🛠️ Quickstart Development Setup

1. **Fork & Clone**:
   ```bash
   git clone https://github.com/Adarshmilan/hacktober2026.git
   cd hacktober2026
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Local AI Engine (Ollama)**:
   Ensure you have [Ollama](https://ollama.com/) running locally with `gemma4:e2b`:
   ```bash
   ollama pull gemma4:e2b
   ollama serve
   ```
   *No external API keys are required to develop or test locally!*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** to experience both the **Dark Obsidian Landing Page** and the **Light Alabaster Workspace**.

---

## 📐 Architecture & Principles

- **Zero Synthetic Hallucinations**: Every cited AST node, file path, and line range must correlate with real repository trees.
- **Dual-Surface Visual Excellence**:
  - Landing surface: Obsidian black (`#070708` / `#0F0F12`), hairline accents, live interactive telemetry.
  - Workspace surface: High-craft architectural alabaster (`#FFFFFF` / `#FAFAFA`), clean hairline borders (`#E4E4E7`).
- **Strict TypeScript & Zod Guardrails**:
  - Strict mode enabled across all `/src` modules.
  - All API routes strictly validate schemas using Zod.

---

## 📋 Pull Request & Commit Guidelines

1. **Conventional Commits**:
   - `feat(triage): add paste buffer support for error screenshots`
   - `fix(github): handle rate-limit retry gracefully`
   - `docs(readme): add Ollama local execution benchmarks`
2. **Pre-flight Checks**:
   Always run and verify:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```
3. **Use GitCompass 404 to Open Your PR!**:
   Navigate to **Tab 04 (PR Description & Rules Helper)** in the app, paste your `git diff`, and let GitCompass 404 generate your compliant PR description!

---

## 🤝 Code of Conduct

We are dedicated to providing a welcoming, diverse, and inclusive environment. Please treat all contributors with kindness, dignity, and respect.

Distributed under the **MIT License**. Copyright (c) 2026 **Team 404 Not Found**.
