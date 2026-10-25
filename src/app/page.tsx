/**
 * Home page: shared repo input, four feature tabs and their results.
 * Exports: HomePage (default).
 * Depends on: react, @/components/*, @/lib/client/*, @/lib/github/parse-repo-url, @/types.
 */
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DiffInput } from "@/components/forms/DiffInput";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { INPUT_CLASS, RepoInput } from "@/components/forms/RepoInput";
import { FeatureTabs } from "@/components/layout/FeatureTabs";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { BugReportResult } from "@/components/results/BugReportResult";
import { ExplainerResult } from "@/components/results/ExplainerResult";
import { IssueList } from "@/components/results/IssueList";
import { PrResult } from "@/components/results/PrResult";
import { Button } from "@/components/ui/Button";
import { RequestStatus } from "@/components/ui/RequestStatus";
import { getJson, postForm, postJson } from "@/lib/client/api-client";
import { useApiRequest } from "@/lib/client/use-api-request";
import { REQUEST_LIMITS } from "@/lib/config/limits";
import { parseRepoUrl } from "@/lib/github/parse-repo-url";
import type * as T from "@/types";

type TabId = "explain" | "issues" | "bug" | "pr";

const TABS = [
  { id: "explain", label: "Explain repo" },
  { id: "issues", label: "Find issues" },
  { id: "bug", label: "Bug report" },
  { id: "pr", label: "PR helper" },
] as const satisfies ReadonlyArray<{ id: TabId; label: string }>;

function safeRepoRef(input: string): T.RepoRef | null {
  try {
    return input.trim() ? parseRepoUrl(input) : null;
  } catch {
    return null;
  }
}

export default function HomePage() {
  const [tab, setTab] = useState<TabId>("explain");
  const [language, setLanguage] = useState<T.Language>("en");
  const [models, setModels] = useState<T.GemmaModelInfo[]>([]);
  const [model, setModel] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [diff, setDiff] = useState("");
  const [bugRepo, setBugRepo] = useState<T.RepoRef | null>(null);

  const explain = useApiRequest<T.ExplainResult>();
  const issues = useApiRequest<T.IssuesData>();
  const bug = useApiRequest<T.BugReportResult>();
  const pr = useApiRequest<T.PrResult>();

  useEffect(() => {
    let active = true;
    void getJson<T.ModelsData>("/api/models").then((response) => {
      if (!active || !response.ok) return;
      setModels(response.data.models);
      setModel(response.data.defaultModel);
    });
    return () => {
      active = false;
    };
  }, []);

  const options = { language, ...(model ? { model } : {}) };
  const repo = repoUrl.trim() ? { repoUrl: repoUrl.trim() } : {};

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tab === "explain") {
      void explain.run(() => postJson("/api/explain", { ...repo, ...options }));
    } else if (tab === "issues") {
      void issues.run(() => postJson("/api/issues", { ...repo, ...options }));
    } else if (tab === "pr") {
      void pr.run(() => postJson("/api/pr", { diff, ...repo, ...options }));
    } else if (image) {
      const form = new FormData();
      form.set("image", image);
      form.set("notes", notes);
      form.set("repoUrl", repoUrl.trim());
      form.set("language", language);
      if (model) form.set("model", model);
      setBugRepo(safeRepoRef(repoUrl));
      void bug.run(() => postForm("/api/bug-report", form));
    }
  }

  const loading = [explain, issues, bug, pr].some((r) => r.state.status === "loading");
  const repoRequired = tab === "explain" || tab === "issues";
  const submitLabel = {
    explain: "Explain this repo",
    issues: "Find beginner issues",
    bug: "Write bug report",
    pr: "Write PR description",
  }[tab];

  return (
    <>
      <Header
        language={language}
        onLanguageChange={setLanguage}
        models={models}
        model={model}
        onModelChange={setModel}
      />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <FeatureTabs tabs={TABS} active={tab} onChange={setTab} />

        <form
          id={`panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <RepoInput value={repoUrl} onChange={setRepoUrl} required={repoRequired} />

          {tab === "bug" && (
            <>
              <ImageUpload file={image} onChange={setImage} />
              <div>
                <label htmlFor="notes" className="mb-1 block text-sm font-medium">
                  Notes{" "}
                  <span className="font-normal text-slate-600 dark:text-slate-400">
                    (optional: what were you doing?)
                  </span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  maxLength={REQUEST_LIMITS.maxNotesChars}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </>
          )}
          {tab === "pr" && <DiffInput value={diff} onChange={setDiff} />}

          <Button type="submit" loading={loading} disabled={tab === "bug" && !image}>
            {submitLabel}
          </Button>
        </form>

        <section aria-label="Result" lang={language}>
          {tab === "explain" && (
            <RequestStatus
              state={explain.state}
              idleHint="Paste a repository and get a beginner-friendly tour of it."
              render={(data) => <ExplainerResult result={data} />}
            />
          )}
          {tab === "issues" && (
            <RequestStatus
              state={issues.state}
              idleHint="Find open issues that suit a first contribution, easiest first."
              render={(data) => <IssueList data={data} />}
            />
          )}
          {tab === "bug" && (
            <RequestStatus
              state={bug.state}
              idleHint="Upload a screenshot of an error or broken UI to get a ready-to-file issue."
              render={(data) => <BugReportResult report={data} repo={bugRepo} />}
            />
          )}
          {tab === "pr" && (
            <RequestStatus
              state={pr.state}
              idleHint="Paste your diff to get a clear PR title and description."
              render={(data) => <PrResult result={data} />}
            />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
