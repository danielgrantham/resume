import type { Terminal } from "../../terminal/Terminal.ts";
import type { FileSystem } from "../../filesystem/FileSystem.ts";
import { renderMarkdown } from "../../terminal/MarkdownRenderer.ts";

export async function granthamAbout(terminal: Terminal, fs: FileSystem): Promise<void> {
  const content = await fs.fetchContent("about.md");
  if (!content) {
    terminal.printError("Error: Unable to load content.");
    return;
  }
  await terminal.streamSpans(renderMarkdown(content));
}
