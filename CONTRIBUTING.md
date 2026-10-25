# Contributing

Thanks for helping! This project exists to make first contributions easier, so first-timers are
very welcome here.

## Setup

1. Fork the repository and clone your fork.
2. Install dependencies: `npm install` (Node.js 20.9 or newer).
3. Copy `.env.example` to `.env.local` and add your own `GEMINI_API_KEY` and `GEMMA_MODEL`
   (see the README for where to get them). Never commit `.env.local`.
4. Start the app: `npm run dev`.

## Branches and pull requests

- Branch from `main` with a short descriptive name, such as `fix/issue-list-empty-state` or
  `feat/explain-file`.
- Keep each PR focused on one change. Link the issue it closes (`Closes #123`).
- Before opening a PR, make sure all of these pass:
  ```bash
  npm run lint && npm run typecheck && npm test && npm run build
  ```
- Fill in the pull request template. You can even use the app's own **PR helper** tab to draft it.

## Code style

- **TypeScript strict mode, no `any`.** Validate external data with Zod.
- **One responsibility per file**, roughly 200 lines at most. Split larger files.
- **Imports use the `@/` alias** (`@/lib/...`), never relative paths. ESLint enforces this.
- **Every file starts with a header comment** saying what it does, what it exports and what it
  depends on.
- Names: files in kebab-case, React components in PascalCase, shared types in `src/types/`.
- Comments explain _why_, not _what_. No dead code or leftover TODOs.
- Prettier formats everything: run `npm run format`.

## Security rules for contributors

- Read secrets only through `src/lib/config/env.ts`. Never import it (or anything that imports it)
  into client components.
- Never fetch a URL that came from user input. GitHub calls go through `lib/github/client.ts`.
- Wrap all repo, issue, diff and user text with `wrapUntrusted()` before it goes into a prompt.
- Log only through `lib/utils/logger.ts`, and never log prompts, user text or images.
- Render model output as text. Do not use `dangerouslySetInnerHTML`.

## Adding a new feature

1. **Schemas:** add the request schema to `src/schemas/requests.ts` and the model output schema to
   `src/schemas/responses.ts`, then export the inferred types from `src/types/index.ts`.
2. **Prompt:** create `src/lib/gemma/prompts/<feature>.ts` using `buildSystemPrompt()` from
   `shared.ts`, so the security and grounding rules are always included.
3. **Service:** create `src/lib/services/<feature>-service.ts`. Fetch data, wrap untrusted text,
   call `generateJson()` and check any cited paths with `createPathResolver()`.
4. **Route:** add `src/app/api/<feature>/route.ts` using `withRoute()` and `parseJsonBody()`.
   Keep it under 40 lines.
5. **UI:** add a result component in `src/components/results/` and a tab in `src/app/page.tsx`.
6. **Tests:** add Vitest tests in `tests/` for any pure logic.

## Good first issues

Looking for somewhere to start? These are great first contributions:

- Add tests for `memory-cache.ts` and `verify-paths.ts`.
- Show a "copied" toast that screen readers announce more clearly.
- Add another output language (prompt name, language schema and dropdown option).
- Add a "Clear" button to each tab's form.
- Improve the empty state of the issue finder with a link to the repo's issues page.

Issues labeled `good first issue` on GitHub are kept up to date. Comment on one before starting so
nobody duplicates work.
