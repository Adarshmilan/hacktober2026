/**
 * Root layout for the whole app.
 * Exports: RootLayout (default), metadata.
 * Depends on: next (types), @/app/globals.css.
 *
 * Uses a system font stack instead of next/font so builds never need network
 * access and Hindi/Gujarati text renders with the OS fonts.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "OpenSource Contributor Helper",
  description:
    "Understand a GitHub repo, find good first issues, turn screenshots into bug reports, and write PR descriptions with Gemma.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
