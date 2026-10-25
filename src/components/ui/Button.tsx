/**
 * Reusable button with primary and secondary styles and a loading state.
 * Exports: Button.
 * Depends on: react (types), @/components/ui/Spinner.
 */
import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  loading?: boolean;
}

const VARIANTS = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary:
    "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
} as const;

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && <Spinner label="" />}
      {children}
    </button>
  );
}
