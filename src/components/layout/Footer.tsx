/**
 * Site footer with license and privacy notes.
 * Exports: Footer.
 * Depends on: nothing.
 */
export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 py-6 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
      <p>
        Open source under the MIT License. Built for Hacktoberfest with Gemma via the Gemini API.
      </p>
      <p className="mt-1">
        Repository data comes from the public GitHub API. This app stores nothing and has no
        accounts.
      </p>
    </footer>
  );
}
