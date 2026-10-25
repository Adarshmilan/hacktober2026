/**
 * Accessible tab bar for the four features (arrow keys, Home and End move
 * between tabs, following the WAI-ARIA tabs pattern).
 * Exports: FeatureTabs, FeatureTab type.
 * Depends on: react.
 */
"use client";

import { useRef, type KeyboardEvent } from "react";

export interface FeatureTab<Id extends string> {
  id: Id;
  label: string;
}

interface FeatureTabsProps<Id extends string> {
  tabs: ReadonlyArray<FeatureTab<Id>>;
  active: Id;
  onChange: (id: Id) => void;
}

export function FeatureTabs<Id extends string>({ tabs, active, onChange }: FeatureTabsProps<Id>) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = tabs.findIndex((tab) => tab.id === active);
    const moves: Record<string, number> = {
      ArrowRight: (current + 1) % tabs.length,
      ArrowLeft: (current - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = moves[event.key];
    const nextTab = next === undefined ? undefined : tabs[next];
    if (next === undefined || !nextTab) return;
    event.preventDefault();
    onChange(nextTab.id);
    buttons.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Features"
      onKeyDown={handleKeyDown}
      className="flex flex-wrap gap-1 rounded-xl bg-slate-200 p-1 dark:bg-slate-800"
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-500 ${
              selected
                ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
