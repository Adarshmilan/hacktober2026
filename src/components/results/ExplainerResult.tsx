/**
 * Renders the repo explainer result with a source for every claim.
 * Exports: ExplainerResult.
 * Depends on: @/components/ui/*, @/lib/client/markdown, @/types.
 */
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { explainToMarkdown } from "@/lib/client/markdown";
import type { ExplainResult } from "@/types";

function Source({ path }: { path: string }) {
  if (path === "unknown") {
    return (
      <span className="text-xs italic text-amber-700 dark:text-amber-300">no source found</span>
    );
  }
  return <code className="text-xs text-slate-600 dark:text-slate-400">{path}</code>;
}

const Empty = () => <p className="text-sm text-slate-600 dark:text-slate-400">Nothing found.</p>;

export function ExplainerResult({ result }: { result: ExplainResult }) {
  return (
    <div className="space-y-4">
      <Card
        title="Summary"
        actions={<CopyButton text={explainToMarkdown(result)} label="Copy as markdown" />}
      >
        <p className="whitespace-pre-wrap">{result.summary}</p>
      </Card>

      <Card title="Tech stack">
        {result.techStack.length === 0 ? (
          <Empty />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {result.techStack.map((item) => (
              <li
                key={item.name}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm dark:bg-slate-800"
              >
                {item.name} <Source path={item.source} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="How to run it locally">
        {result.howToRunLocally.length === 0 ? (
          <Empty />
        ) : (
          <ol className="list-decimal space-y-2 pl-5">
            {result.howToRunLocally.map((item, index) => (
              <li key={index}>
                <span className="whitespace-pre-wrap">{item.step}</span>{" "}
                <Source path={item.source} />
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card title="Folders">
        {result.folders.length === 0 ? (
          <Empty />
        ) : (
          <dl className="space-y-2">
            {result.folders.map((folder) => (
              <div key={folder.path}>
                <dt>
                  <code className="text-sm font-semibold">{folder.path}</code>
                </dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300">{folder.purpose}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      <Card title="Where to start">
        {result.whereToStart.length === 0 ? (
          <Empty />
        ) : (
          <ul className="space-y-2">
            {result.whereToStart.map((item) => (
              <li key={item.path}>
                <code className="text-sm font-semibold">{item.path}</code>
                <p className="text-sm text-slate-700 dark:text-slate-300">{item.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Sources used">
        {result.sources.length === 0 ? (
          <Empty />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {result.sources.map((source) => (
              <li key={source}>
                <code className="text-xs">{source}</code>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
