# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report it privately through GitHub: open the repository's **Security** tab and click
**Report a vulnerability**. (Maintainers: enable this under _Settings → Code security →
Private vulnerability reporting_.)

Please include:

- What the problem is and its impact
- Steps to reproduce, or a proof of concept that does not harm real users or data
- The commit or version you tested

We aim to acknowledge reports within 3 days and to share a plan for a fix within 14 days.

## Supported versions

Only the latest commit on `main` receives security fixes.

## Scope

In scope: this application's code, including SSRF, prompt-injection paths that leak secrets,
upload handling, rate-limit bypasses and anything that exposes `GEMINI_API_KEY` or `GITHUB_TOKEN`.

Out of scope: vulnerabilities in GitHub, the Gemini API or third-party dependencies (report those
upstream), and the model sometimes giving wrong answers.

## For people running this app

- Keep your keys in `.env.local` (never committed) or your host's secret settings.
- Use a fine-grained GitHub token with no extra permissions.
- Set a sensible `RATE_LIMIT_PER_MIN` and a spending limit on your Gemini API key.
