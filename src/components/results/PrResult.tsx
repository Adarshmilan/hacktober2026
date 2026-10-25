/**
 * Renders the generated PR title and description with copy actions.
 * Exports: PrResult.
 * Depends on: @/components/ui/*, @/lib/client/markdown, @/types.
 */
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { prToMarkdown } from "@/lib/client/markdown";
import type { PrResult as PrResultData } from "@/types";

export function PrResult({ result }: { result: PrResultData }) {
  return (
    <div className="space-y-4">
      <Card title="Title" actions={<CopyButton text={result.title} label="Copy title" />}>
        <p className="font-medium">{result.title}</p>
      </Card>

      <Card
        title="Description"
        actions={<CopyButton text={prToMarkdown(result)} label="Copy as markdown" />}
      >
        <p className="whitespace-pre-wrap text-sm">{result.description}</p>
      </Card>

      <Card title="Changes">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {result.changesList.map((change, index) => (
            <li key={index}>{change}</li>
          ))}
        </ul>
      </Card>

      <Card title="Testing">
        <p className="whitespace-pre-wrap text-sm">{result.testingNotes}</p>
      </Card>

      <Card title="Checklist">
        <ul className="space-y-1 text-sm">
          {result.checklist.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true">☐</span>
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
