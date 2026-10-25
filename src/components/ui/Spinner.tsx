/**
 * Accessible loading spinner.
 * Exports: Spinner.
 * Depends on: nothing.
 */
interface SpinnerProps {
  /** Screen-reader text. Pass "" when a nearby element already announces loading. */
  label?: string;
}

export function Spinner({ label = "Loading" }: SpinnerProps) {
  return (
    <span role={label ? "status" : undefined} className="inline-flex items-center">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
