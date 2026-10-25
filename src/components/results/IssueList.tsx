/**
 * Renders the ranked good-first-issue list.
 * Exports: IssueList.
 * Depends on: @/components/ui/*, @/lib/client/markdown, @/types.
 */
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { issuesToMarkdown } from "@/lib/client/markdown";
import type { IssuesData } from "@/types";

const DIFFICULTY_STYLES = {
  easy: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
  medium: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
  hard: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
} as const;

export function IssueList({ data }: { data: IssuesData }) {
  if (data.issues.length === 0) {
    return (
      <Card>
        <p className="text-sm">
          No open, unassigned issues were found. Try another repository, or check back later.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CopyButton text={issuesToMarkdown(data)} label="Copy list as markdown" />
      </div>
      <ol className="space-y-4">
        {data.issues.map((issue) => (
          <li key={issue.number}>
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-700 underline-offset-2 hover:underline dark:text-indigo-300"
                >
                  #{issue.number} {issue.title}
                  <span className="sr-only"> (opens GitHub in a new tab)</span>
                </a>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_STYLES[issue.difficulty]}`}
                >
                  {issue.difficulty} · {Math.round(issue.confidence * 100)}% sure
                </span>
              </div>
              <p className="mt-2 text-sm">{issue.whyBeginnerFriendly}</p>
              <p className="mt-2 text-sm">
                <span className="font-medium">First step: </span>
                {issue.suggestedFirstStep}
              </p>
              {issue.likelyFiles.length > 0 && (
                <p className="mt-2 text-sm">
                  <span className="font-medium">Likely files: </span>
                  {issue.likelyFiles.map((file) => (
                    <code key={file} className="mr-2 text-xs">
                      {file}
                    </code>
                  ))}
                </p>
              )}
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
