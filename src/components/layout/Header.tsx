/**
 * Site header with the app name, language selector and Gemma model selector.
 * Exports: Header.
 * Depends on: @/types.
 */
import type { GemmaModelInfo, Language } from "@/types";

const LANGUAGES: ReadonlyArray<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
];

const SELECT_CLASS =
  "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

interface HeaderProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  models: GemmaModelInfo[];
  model: string;
  onModelChange: (model: string) => void;
}

export function Header({ language, onLanguageChange, models, model, onModelChange }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <p className="text-lg font-bold">OpenSource Contributor Helper</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your first open-source contribution, made easier. Powered by Gemma.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            Language
            <select
              className={SELECT_CLASS}
              value={language}
              onChange={(event) => onLanguageChange(event.target.value as Language)}
            >
              {LANGUAGES.map((option) => (
                <option key={option.code} value={option.code} lang={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            Model
            <select
              className={SELECT_CLASS}
              value={model}
              disabled={models.length === 0}
              onChange={(event) => onModelChange(event.target.value)}
            >
              {models.length === 0 && <option value="">Loading models…</option>}
              {models.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.displayName}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}
