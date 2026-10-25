/**
 * Trims text to a character budget, keeping the beginning and the sections a
 * newcomer needs most (install, setup, usage, contributing...).
 * Exports: trimContent(), cutAtBoundary(), TRUNCATION_MARKER.
 * Depends on: nothing.
 */
export const TRUNCATION_MARKER = "\n[...truncated]";

const HEADING_LINE = /^#{1,6}\s+\S/;
const CODE_FENCE = /^\s*(```|~~~)/;
const IMPORTANT_HEADING =
  /\b(install|setup|set up|getting started|quick ?start|usage|running|run|build|develop|test|contribut|requirement|prerequisite)/i;

interface Section {
  text: string;
  important: boolean;
}

/**
 * Cuts text to at most maxChars, ending on a line or word boundary.
 * Falls back to a hard cut only when there is no whitespace at all, such as a
 * minified file, because returning nothing would be worse.
 */
export function cutAtBoundary(text: string, maxChars: number): string {
  if (maxChars <= 0) return "";
  if (text.length <= maxChars) return text;

  const slice = text.slice(0, maxChars);

  // A nearby line break gives cleaner cuts for diffs and lists.
  const lastNewline = slice.lastIndexOf("\n");
  if (lastNewline >= maxChars * 0.75) return slice.slice(0, lastNewline).trimEnd();

  if (/\s/.test(text.charAt(maxChars))) return slice.trimEnd();

  const lastWhitespace = slice.search(/\s\S*$/);
  if (lastWhitespace > 0) return slice.slice(0, lastWhitespace).trimEnd();

  return slice;
}

function splitSections(text: string): Section[] {
  const sections: Section[] = [];
  let current: string[] = [];
  let inCodeFence = false;

  const flush = () => {
    if (current.length === 0) return;
    const body = current.join("\n");
    // The opening section is the project intro, so it always counts as important.
    const important = sections.length === 0 || IMPORTANT_HEADING.test(current[0] ?? "");
    sections.push({ text: body, important });
    current = [];
  };

  for (const line of text.split("\n")) {
    if (CODE_FENCE.test(line)) inCodeFence = !inCodeFence;
    if (!inCodeFence && HEADING_LINE.test(line)) flush();
    current.push(line);
  }
  flush();
  return sections;
}

function pickSections(sections: Section[], budget: number): string {
  const order = [
    ...sections.flatMap((section, index) => (section.important ? [index] : [])),
    ...sections.flatMap((section, index) => (section.important ? [] : [index])),
  ];

  const chosen = new Map<number, string>();
  let remaining = budget;

  for (const index of order) {
    const separator = chosen.size > 0 ? 1 : 0;
    const available = remaining - separator;
    if (available <= 0) break;

    const text = sections[index]?.text ?? "";
    const kept = text.length <= available ? text : cutAtBoundary(text, available);
    if (kept.trim().length === 0) continue;

    chosen.set(index, kept);
    remaining -= kept.length + separator;
  }

  return [...chosen.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, text]) => text)
    .join("\n");
}

export function trimContent(text: string, maxChars: number): string {
  if (maxChars <= 0) return "";
  if (text.length <= maxChars) return text;

  const budget = maxChars - TRUNCATION_MARKER.length;
  if (budget <= 0) return cutAtBoundary(text, maxChars);

  return pickSections(splitSections(text), budget) + TRUNCATION_MARKER;
}
