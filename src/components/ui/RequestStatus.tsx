/**
 * Shows the loading, error or empty state of a request, or renders its result.
 * Exports: RequestStatus.
 * Depends on: react (types), @/components/ui/ErrorMessage, @/components/ui/Spinner, @/types.
 */
import type { ReactNode } from "react";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Spinner } from "@/components/ui/Spinner";
import type { RequestState } from "@/types";

interface RequestStatusProps<T> {
  state: RequestState<T>;
  idleHint: string;
  render: (data: T) => ReactNode;
}

export function RequestStatus<T>({ state, idleHint, render }: RequestStatusProps<T>) {
  switch (state.status) {
    case "idle":
      return <p className="text-sm text-slate-600 dark:text-slate-400">{idleHint}</p>;
    case "loading":
      return (
        <div className="flex items-center gap-3 text-sm" aria-live="polite">
          <Spinner label="" />
          Working on it. This can take up to a minute.
        </div>
      );
    case "error":
      return <ErrorMessage error={state.error} />;
    case "success":
      return <>{render(state.data)}</>;
  }
}
