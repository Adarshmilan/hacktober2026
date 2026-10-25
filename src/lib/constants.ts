import {
  RepoMetadata,
  BugReportDraft,
  DirectoryExplainer,
  RecommendedFile,
  GoodFirstIssue,
  PRDraft,
} from "@/types";

// =========================================================================
// 1. DEFAULT BASELINE: vercel/next.js
// =========================================================================

export const DEFAULT_REPO: RepoMetadata = {
  owner: "vercel",
  repo: "next.js",
  url: "https://github.com/vercel/next.js",
  branch: "MAIN",
  stars: 128000,
  openIssuesCount: 412,
  license: "MIT",
  hasContributing: true,
  repoOnboardingScore: 94,
  compatibilityBadge: "● MAINTAINER VERIFIED",
  description: "The React Framework for the Web",
};

export const DEFAULT_BUG_REPORT: BugReportDraft = {
  issueTitle: "[Bug]: Unhandled TypeError in CheckoutForm when submitting empty state",
  screenshotName: "console-error-trace.png",
  resolution: "1240 × 820px",
  ocrConfidence: "100% OCR CONFIDENCE",
  ocrStatus: "Optical Character & Callstack Ingestion Complete",
  errorType: "TypeError",
  errorMessage: "Cannot read properties of undefined (reading 'items')",
  callstack: [
    "at CheckoutForm (CheckoutForm.tsx:42:18)",
    "at renderWithHooks (react-dom.development.js:15486)",
    "at updateFunctionComponent (react-dom.development.js:19588)",
  ],
  reproducerContext:
    "Clicked checkout button on mobile viewport when cart items were null. Local storage mock returned 204 with empty payload.",
  targetTemplate: "Target: issue-template.md",
  summaryEvidence: {
    text: "During empty-state form submission on mobile viewports, the application throws an unhandled client exception. Optical Character Recognition on",
    codePills: [
      "console-error-trace.png",
      "TypeError",
      "cart",
      "cart.items",
      "undefined",
    ],
  },
  stepsToReproduce: [
    "Navigate to `/checkout` on mobile viewport (390×844px) with cleared LocalStorage session.",
    "Bypass item selection by clicking the primary checkout submission trigger.",
    "Observe immediate runtime breakdown and unhandled rejection in React hook lifecycle.",
  ],
  expectedBehavior:
    "The component should safely evaluate `cart?.items?.length` fallback guard, present an accessible empty state alert notification, and keep the user on the page without unmounting.",
  actualBehavior:
    "Runtime throws an unhandled client-side exception: TypeError: Cannot read properties of undefined (reading 'items'), causing white-screen crash in React root.",
  correlatedNodes: [
    {
      filePath: "src/components/checkout/CheckoutForm.tsx",
      matchScore: 94,
      badgeLabel: "94% Match · Suspected Culprit",
      badgeVariant: "crimson",
      description:
        "AST node `handleSubmission` references unvalidated accessor `cart.items` without fallback guard.",
      lineRange: "L42-L48",
      functionName: "handleSubmission",
    },
    {
      filePath: "src/api/orders/route.ts",
      matchScore: 78,
      badgeLabel: "Secondary Reference",
      badgeVariant: "zinc",
      description:
        "Endpoint returns `{ order: null }` when payload contains zero line items.",
      lineRange: "L89-L94",
      functionName: "POST",
    },
  ],
};

export const DEFAULT_DIRECTORIES: DirectoryExplainer[] = [
  {
    path: "packages/next/",
    title: "Next.js Core Runtime & CLI",
    description: "Contains the server runtime, client router, bundling pipeline, and command line tools.",
    fileCount: "420+ files",
    importance: "high",
  },
  {
    path: "crates/next-core/",
    title: "Turbopack Rust Compiler",
    description: "High-performance Rust-based build engine powering ultra-fast module bundling and HMR.",
    fileCount: "180+ files",
    importance: "medium",
  },
  {
    path: "test/",
    title: "End-to-End & Unit Suites",
    description: "Regression suites, integration tests, and production build verification fixtures.",
    fileCount: "950+ tests",
    importance: "high",
  },
  {
    path: "examples/",
    title: "Official Starter Templates",
    description: "Curated boilerplate apps demonstrating SSR, SSG, Auth, and external database adapters.",
    fileCount: "110+ apps",
    importance: "low",
  },
  {
    path: "docs/",
    title: "Developer Documentation",
    description: "API references, deployment guides, and feature walkthroughs written in Markdown.",
    fileCount: "350+ pages",
    importance: "medium",
  },
];

export const DEFAULT_RECOMMENDED_FILES: RecommendedFile[] = [
  {
    path: "packages/next/src/client/link.tsx",
    githubUrl: "https://github.com/vercel/next.js/blob/canary/packages/next/src/client/link.tsx",
    role: "Client Navigation Component",
    whyStartHere: "Self-contained React component with isolated props, clear TypeScript types, and comprehensive tests.",
    lines: 284,
    difficulty: "Beginner",
  },
  {
    path: "packages/next/src/server/config-shared.ts",
    githubUrl: "https://github.com/vercel/next.js/blob/canary/packages/next/src/server/config-shared.ts",
    role: "Configuration Schema & Defaults",
    whyStartHere: "Great place to understand all configuration flags, environment fallbacks, and schema validation.",
    lines: 390,
    difficulty: "Beginner",
  },
  {
    path: "packages/next/src/shared/lib/router/router.ts",
    githubUrl: "https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/router/router.ts",
    role: "Routing Engine & History",
    whyStartHere: "Core state machine handling browser history, route prefetching, and navigation events.",
    lines: 640,
    difficulty: "Intermediate",
  },
];

export const DEFAULT_GOOD_FIRST_ISSUES: GoodFirstIssue[] = [
  {
    id: 64120,
    number: 64120,
    title: "docs: Fix broken anchor link in Turbopack loaders configuration guide",
    htmlUrl: "https://github.com/vercel/next.js/issues/64120",
    difficulty: "1/5 (Beginner)",
    clarityScore: 98,
    isUnlabeledGem: false,
    category: "Docs",
    plainExplanation: "The documentation page for Turbopack loader rules points to an outdated section hash (`#custom-loaders`). Needs updating to the active anchor `#configuring-turbopack`.",
    suspectedFiles: ["docs/02-app/02-api-reference/05-next-config-js/turbopack.mdx"],
    starterSteps: [
      "Locate the link reference in `turbopack.mdx` on line 142.",
      "Update URL fragment to `#configuring-turbopack`.",
      "Run `pnpm test-docs` to ensure lint check passes.",
    ],
    labels: ["documentation", "good first issue"],
  },
  {
    id: 63984,
    number: 63984,
    title: "fix(image): Improve descriptive warning when unoptimized image missing blurDataURL",
    htmlUrl: "https://github.com/vercel/next.js/issues/63984",
    difficulty: "1/5 (Beginner)",
    clarityScore: 96,
    isUnlabeledGem: true,
    category: "Frontend",
    plainExplanation: "When using `placeholder=\"blur\"` on `next/image` without static imports, the console warning message is slightly vague. Enhancing it will save newcomers hours of debugging.",
    suspectedFiles: ["packages/next/src/client/image-component.tsx"],
    starterSteps: [
      "Open `packages/next/src/client/image-component.tsx` around line 215.",
      "Refine the warning string to point directly to the documentation URL.",
      "Add unit assertion in `test/unit/image.test.tsx`.",
    ],
    labels: ["area: next/image"],
  },
  {
    id: 63812,
    number: 63812,
    title: "refactor: Add missing prop types for Link component prefetch prop options",
    htmlUrl: "https://github.com/vercel/next.js/issues/63812",
    difficulty: "1/5 (Beginner)",
    clarityScore: 94,
    isUnlabeledGem: true,
    category: "Frontend",
    plainExplanation: "TypeScript type definition for `LinkProps['prefetch']` permits boolean but lacks the string literal `'auto'` union in legacy helper interface.",
    suspectedFiles: ["packages/next/src/client/link.tsx", "packages/next/src/shared/lib/router/router.ts"],
    starterSteps: [
      "Add `'auto' | null` to `LinkProps` interface.",
      "Check that IDE autocomplete displays docstring comment.",
      "Execute `pnpm typecheck`.",
    ],
    labels: ["typescript", "area: routing"],
  },
  {
    id: 63740,
    number: 63740,
    title: "examples: Update with-tailwindcss template to Tailwind CSS 4 syntax",
    htmlUrl: "https://github.com/vercel/next.js/issues/63740",
    difficulty: "2/5 (Easy)",
    clarityScore: 91,
    isUnlabeledGem: false,
    category: "Frontend",
    plainExplanation: "The official Tailwind example still specifies `@tailwind base` directives instead of standard `@import \"tailwindcss\";`.",
    suspectedFiles: ["examples/with-tailwindcss/app/globals.css", "examples/with-tailwindcss/package.json"],
    starterSteps: [
      "Update `app/globals.css` with `@import \"tailwindcss\";`.",
      "Run test build inside `examples/with-tailwindcss`.",
      "Verify styles compile cleanly in production mode.",
    ],
    labels: ["examples", "good first issue"],
  },
];

export const DEFAULT_PR_DRAFT: PRDraft = {
  title: "fix(checkout): add defensive null checks for cart item accessor in CheckoutForm",
  body: `### Summary of Changes
- Adds safe optional chaining guard (\`cart?.items?.length\`) inside \`handleSubmission\` in \`CheckoutForm.tsx\`
- Prevents unhandled \`TypeError: Cannot read properties of undefined (reading 'items')\` when cart session is empty or null
- Renders accessible inline warning alert instead of crashing React component tree

### Fixes Issue
Fixes #412

### Visual Verification
- Tested on Chromium Mobile Viewport (iPhone 14 Emulation, 390×844)
- Verified LocalStorage null mock returns 204 without throwing uncaught client error

### Checklist
- [x] Conventional Commit title format followed
- [x] Linked existing issue #412
- [x] Added unit tests for empty cart state
- [x] Ran \`pnpm lint\` and \`pnpm typecheck\` with 0 errors
`,
  checks: [
    {
      id: "commit_title",
      label: "Conventional Commit Title Format",
      passed: true,
      detail: "Matches `fix(scope): concise description` specification.",
    },
    {
      id: "linked_issue",
      label: "Linked Issue Reference",
      passed: true,
      detail: "Includes `Fixes #412` targeting active triage report.",
    },
    {
      id: "test_plan",
      label: "Verification & Test Plan Included",
      passed: true,
      detail: "Specifies viewport emulation and unit tests.",
    },
    {
      id: "breaking_changes",
      label: "Zero Breaking Changes Declared",
      passed: true,
      detail: "Purely defensive backwards-compatible fallback guard.",
    },
  ],
  suspectedFiles: [
    "src/components/checkout/CheckoutForm.tsx",
    "src/components/checkout/__tests__/CheckoutForm.test.tsx",
  ],
  diffPreview: `diff --git a/src/components/checkout/CheckoutForm.tsx b/src/components/checkout/CheckoutForm.tsx
index 8e4b1a2..9f1c3d4 100644
--- a/src/components/checkout/CheckoutForm.tsx
+++ b/src/components/checkout/CheckoutForm.tsx
@@ -39,7 +39,11 @@ export function CheckoutForm({ cart, onComplete }: Props) {
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   const handleSubmission = async (e: React.FormEvent) => {
     e.preventDefault();
-    if (cart.items.length === 0) {
+    if (!cart?.items || cart.items.length === 0) {
+      setErrorMessage("Your cart is empty. Please select an item to continue.");
       return;
     }
     setIsSubmitting(true);
`,
};

// =========================================================================
// 2. PRE-CACHED BASELINE: facebook/react
// =========================================================================

export const REACT_REPO: RepoMetadata = {
  owner: "facebook",
  repo: "react",
  url: "https://github.com/facebook/react",
  branch: "MAIN",
  stars: 228000,
  openIssuesCount: 780,
  license: "MIT",
  hasContributing: true,
  repoOnboardingScore: 92,
  compatibilityBadge: "● MAINTAINER VERIFIED",
  description: "The library for web and native user interfaces",
};

export const REACT_DIRECTORIES: DirectoryExplainer[] = [
  {
    path: "packages/react/",
    title: "React Core API",
    description: "Core interfaces: useState, useEffect, createElement, Component, and forwardRef.",
    fileCount: "65 files",
    importance: "high",
  },
  {
    path: "packages/react-dom/",
    title: "React DOM Renderer",
    description: "Client and server DOM reconciling logic, synthetic event dispatch, and hydration.",
    fileCount: "140 files",
    importance: "high",
  },
  {
    path: "packages/react-reconciler/",
    title: "Fiber Reconciler Engine",
    description: "Virtual DOM diffing algorithm, concurrent lane priorities, and work scheduler.",
    fileCount: "95 files",
    importance: "high",
  },
  {
    path: "packages/scheduler/",
    title: "Task Priority Scheduler",
    description: "Cooperative multitasking and time-slicing engine for frame-rate consistency.",
    fileCount: "24 files",
    importance: "medium",
  },
  {
    path: "fixtures/",
    title: "Manual Test Fixtures",
    description: "Standalone browser test cases and regression reproduction apps.",
    fileCount: "80+ apps",
    importance: "low",
  },
];

export const REACT_RECOMMENDED_FILES: RecommendedFile[] = [
  {
    path: "packages/react/src/ReactSharedInternals.js",
    githubUrl: "https://github.com/facebook/react/blob/main/packages/react/src/ReactSharedInternals.js",
    role: "Dispatcher Registry",
    whyStartHere: "Clean, concise bridge between the React package and current renderer dispatcher.",
    lines: 48,
    difficulty: "Beginner",
  },
  {
    path: "packages/react/src/ReactHooks.js",
    githubUrl: "https://github.com/facebook/react/blob/main/packages/react/src/ReactHooks.js",
    role: "Hook Declarations",
    whyStartHere: "Direct hook definitions forwarding calls to resolveDispatcher with full JSDoc comments.",
    lines: 195,
    difficulty: "Beginner",
  },
  {
    path: "packages/shared/ReactSymbols.js",
    githubUrl: "https://github.com/facebook/react/blob/main/packages/shared/ReactSymbols.js",
    role: "Symbol Definitions",
    whyStartHere: "Understand React element type symbols, fragments, suspense, and portal tokens.",
    lines: 110,
    difficulty: "Beginner",
  },
];

export const REACT_GOOD_FIRST_ISSUES: GoodFirstIssue[] = [
  {
    id: 28941,
    number: 28941,
    title: "docs: Fix code block formatting in useActionState documentation",
    htmlUrl: "https://github.com/facebook/react/issues/28941",
    difficulty: "1/5 (Beginner)",
    clarityScore: 97,
    isUnlabeledGem: false,
    category: "Docs",
    plainExplanation: "The markdown snippet inside the `useActionState` reference guide misses closing curly braces on the form action example.",
    suspectedFiles: ["compiler/packages/react-compiler-healthcheck/README.md"],
    starterSteps: [
      "Open documentation markdown file.",
      "Add missing closing braces to syntax example.",
      "Verify markdown renders cleanly with yarn lint.",
    ],
    labels: ["documentation", "good first issue"],
  },
  {
    id: 28710,
    number: 28710,
    title: "fix(devtools): Add missing tooltip description for discarded fiber nodes in Profiler",
    htmlUrl: "https://github.com/facebook/react/issues/28710",
    difficulty: "1/5 (Beginner)",
    clarityScore: 93,
    isUnlabeledGem: true,
    category: "Frontend",
    plainExplanation: "When inspecting interrupted render commits, the tooltip text shows undefined for discarded fiber lanes. Adding a clear fallback string resolves it.",
    suspectedFiles: ["packages/react-devtools-shared/src/devtools/views/Profiler/CommitFlamegraph.js"],
    starterSteps: [
      "Locate CommitFlamegraph.js render tooltip method.",
      "Add default fallback string 'Interrupted during render phase'.",
      "Run yarn test packages/react-devtools-shared.",
    ],
    labels: ["Component: Developer Tools"],
  },
];

// =========================================================================
// 3. PRE-CACHED BASELINE: calcom/cal.com
// =========================================================================

export const CALCOM_REPO: RepoMetadata = {
  owner: "calcom",
  repo: "cal.com",
  url: "https://github.com/calcom/cal.com",
  branch: "MAIN",
  stars: 34000,
  openIssuesCount: 230,
  license: "AGPL-3.0",
  hasContributing: true,
  repoOnboardingScore: 95,
  compatibilityBadge: "● MAINTAINER VERIFIED",
  description: "Scheduling infrastructure for absolutely everyone.",
};

export const CALCOM_DIRECTORIES: DirectoryExplainer[] = [
  {
    path: "apps/web/",
    title: "Main Next.js Web App",
    description: "The primary web dashboard, public booking pages, and API routing infrastructure.",
    fileCount: "350+ files",
    importance: "high",
  },
  {
    path: "packages/core/",
    title: "Core Scheduling Logic",
    description: "Calendar availability calculations, slot allocation algorithms, and booking state machines.",
    fileCount: "120+ files",
    importance: "high",
  },
  {
    path: "packages/prisma/",
    title: "Prisma Database Schema & Migrations",
    description: "PostgreSQL schema, database client client, and migration scripts.",
    fileCount: "45 files",
    importance: "high",
  },
  {
    path: "packages/app-store/",
    title: "Third-party Integrations",
    description: "Google Calendar, Outlook, Zoom, Stripe, and Webhook integrations.",
    fileCount: "210+ files",
    importance: "medium",
  },
];

export const CALCOM_RECOMMENDED_FILES: RecommendedFile[] = [
  {
    path: "packages/lib/date-fns.ts",
    githubUrl: "https://github.com/calcom/cal.com/blob/main/packages/lib/date-fns.ts",
    role: "Timezone & Date Utilities",
    whyStartHere: "Small, isolated pure functions for date manipulation across user timezones.",
    lines: 110,
    difficulty: "Beginner",
  },
  {
    path: "packages/features/auth/lib/hashPassword.ts",
    githubUrl: "https://github.com/calcom/cal.com/blob/main/packages/features/auth/lib/hashPassword.ts",
    role: "Password Hashing Utility",
    whyStartHere: "Simple utility with unit tests and clear return types.",
    lines: 32,
    difficulty: "Beginner",
  },
];

export const CALCOM_GOOD_FIRST_ISSUES: GoodFirstIssue[] = [
  {
    id: 14210,
    number: 14210,
    title: "fix: Booking confirmation email missing calendar invite attachment for ICS download",
    htmlUrl: "https://github.com/calcom/cal.com/issues/14210",
    difficulty: "1/5 (Beginner)",
    clarityScore: 95,
    isUnlabeledGem: false,
    category: "Backend",
    plainExplanation: "The ICS calendar invite is correctly generated but misses the content-disposition header in booking confirmation email templates.",
    suspectedFiles: ["packages/emails/templates/organizer-scheduled-email.tsx"],
    starterSteps: [
      "Open organizer-scheduled-email.tsx.",
      "Ensure attachment array includes ics file link.",
      "Run yarn test:emails.",
    ],
    labels: ["good first issue", "area: email"],
  },
];
