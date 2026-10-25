import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitCompass 404 — Autonomous Open-Source Contributor & Maintainer Intelligence",
  description:
    "The Autonomous Open-Source Contributor & Maintainer Intelligence Platform powered by Google Gemma 4. Multimodal visual bug reports, codebase mapping, issue ranking, and PR compliance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
