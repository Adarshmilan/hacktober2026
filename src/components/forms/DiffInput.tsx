/**
 * Text area for a diff or a list of changed files, with a character counter.
 * Exports: DiffInput.
 * Depends on: @/components/forms/RepoInput, @/lib/config/limits.
 */
import { INPUT_CLASS } from "@/components/forms/RepoInput";
import { REQUEST_LIMITS } from "@/lib/config/limits";

interface DiffInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DiffInput({ value, onChange }: DiffInputProps) {
  const max = REQUEST_LIMITS.maxDiffChars;
  return (
    <div>
      <label htmlFor="diff" className="mb-1 block text-sm font-medium">
        Diff or list of changed files
      </label>
      <textarea
        id="diff"
        rows={12}
        required
        maxLength={max}
        spellCheck={false}
        aria-describedby="diff-hint"
        placeholder={
          "Paste the output of `git diff main`, or list files like:\nsrc/app/page.tsx: added a dark mode toggle"
        }
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${INPUT_CLASS} font-mono`}
      />
      <p id="diff-hint" className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {value.length.toLocaleString()} / {max.toLocaleString()} characters
      </p>
    </div>
  );
}
