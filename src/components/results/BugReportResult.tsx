/**
 * Renders the generated bug report with copy actions and, when a repo was
 * given, a link that opens GitHub's new-issue form prefilled.
 * Exports: BugReportResult.
 * Depends on: react (types), @/components/ui/*, @/lib/client/markdown, @/types.
 */
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { bugReportToMarkdown, newIssueUrl } from "@/lib/client/markdown";
import type { BugReportResult as BugReport, RepoRef } from "@/types";

interface BugReportResultProps {
  report: BugReport;
  repo: RepoRef | null;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">
        {children}
      </div>
    </div>
  );
}

export function BugReportResult({ report, repo }: BugReportResultProps) {
  const markdown = bugReportToMarkdown(report);

  return (
    <div className="space-y-4">
      {report.missingInfoQuestions.length > 0 && (
        <Card title="Answer these before filing">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {report.missingInfoQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card
        title={report.title}
        actions={
          <>
            <CopyButton text={report.title} label="Copy title" />
            <CopyButton text={markdown} label="Copy as markdown" />
          </>
        }
      >
        <div className="space-y-4">
          <Section title="Summary">{report.summary}</Section>
          <Section title="Steps to reproduce">
            <ol className="list-decimal pl-5">
              {report.stepsToReproduce.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </Section>
          <Section title="Expected">{report.expected}</Section>
          <Section title="Actual">{report.actual}</Section>
          <Section title="Environment">{report.environment}</Section>
          <Section title="Possible cause">{report.possibleCause}</Section>
          <Section title="Suggested labels">
            {report.labels.map((label) => (
              <span
                key={label}
                className="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800"
              >
                {label}
              </span>
            ))}
          </Section>
        </div>
      </Card>

      {repo && (
        <Card>
          <a
            href={newIssueUrl(repo, report.title, markdown)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            Open new issue on {repo.owner}/{repo.repo}
            <span className="sr-only"> (opens GitHub in a new tab)</span>
          </a>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Opens GitHub&apos;s new-issue form with this report filled in. Nothing is posted until
            you review it and click Submit on GitHub yourself.
          </p>
        </Card>
      )}
    </div>
  );
}
