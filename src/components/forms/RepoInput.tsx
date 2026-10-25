/**
 * Shared GitHub repository input used by every feature tab.
 * Exports: RepoInput, INPUT_CLASS.
 * Depends on: @/lib/config/limits.
 */
import { REQUEST_LIMITS } from "@/lib/config/limits";

export const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400";

interface RepoInputProps {
  value: string;
  onChange: (value: string) => void;
  required: boolean;
}

export function RepoInput({ value, onChange, required }: RepoInputProps) {
  return (
    <div>
      <label htmlFor="repo-url" className="mb-1 block text-sm font-medium">
        GitHub repository{" "}
        {!required && (
          <span className="font-normal text-slate-600 dark:text-slate-400">
            (optional here: adds the repo&apos;s templates and style)
          </span>
        )}
      </label>
      <input
        id="repo-url"
        type="text"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        required={required}
        maxLength={REQUEST_LIMITS.maxRepoUrlChars}
        placeholder="owner/repo or https://github.com/owner/repo"
        aria-describedby="repo-url-hint"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
      />
      <p id="repo-url-hint" className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        Public repositories only.
      </p>
    </div>
  );
}
