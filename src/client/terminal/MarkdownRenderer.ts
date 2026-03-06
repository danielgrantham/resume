import type { StyledSpan } from "./OutputRenderer.ts";

export function renderMarkdown(markdown: string): StyledSpan[] {
  const lines = markdown.split("\n");
  const spans: StyledSpan[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (line.startsWith("# ")) {
      const heading = line.slice(2).toUpperCase();
      spans.push({ text: heading + "\n", bold: true });
      spans.push({ text: "═".repeat(heading.length) + "\n\n" });
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      const heading = line.slice(3);
      spans.push({ text: heading + "\n", bold: true });
      spans.push({ text: "─".repeat(heading.length) + "\n\n" });
      i++;
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.slice(2);
      spans.push({ text: "  • " });
      pushInlineSpans(spans, content);
      spans.push({ text: "\n" });
      i++;
      continue;
    }

    if (line.trim() === "") {
      spans.push({ text: "\n" });
      i++;
      continue;
    }

    pushInlineSpans(spans, line);
    spans.push({ text: "\n" });
    i++;
  }

  return spans;
}

function pushInlineSpans(spans: StyledSpan[], text: string): void {
  const regex = /(\*\*(.+?)\*\*)|(\[(.+?)\]\((.+?)\))|(`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      spans.push({ text: text.slice(lastIndex, match.index) });
    }

    if (match[1] && match[2]) {
      spans.push({ text: match[2], bold: true });
    } else if (match[3] && match[4] && match[5]) {
      spans.push({ text: match[4], href: match[5] });
    } else if (match[6] && match[7]) {
      spans.push({ text: match[7], className: "ansi-yellow" });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    spans.push({ text: text.slice(lastIndex) });
  }
}
