/**
 * Reusable card container with an optional heading and action buttons.
 * Exports: Card.
 * Depends on: react (types).
 */
import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Card({ title, actions, children }: CardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
