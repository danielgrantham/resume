import type { CommandHandler } from "../registry.ts";
import type { FileSystem } from "../../filesystem/FileSystem.ts";

export function createLs(fs: FileSystem): CommandHandler {
  return async ({ terminal, args }) => {
    const path = args[0];
    const result = fs.ls(path);

    if ("error" in result) {
      terminal.printError(result.error);
      return;
    }

    const spans = result.entries.map((entry, i) => {
      const suffix = i < result.entries.length - 1 ? "  " : "\n";
      if (entry.type === "directory") {
        return { text: entry.name + "/" + suffix, className: "ansi-green" };
      }
      return { text: entry.name + suffix };
    });

    if (spans.length) {
      terminal.printSpans(spans);
    }
  };
}
