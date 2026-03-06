import type { CommandHandler } from "../registry.ts";

export function createRm(): CommandHandler {
  return async ({ terminal, args }) => {
    const joined = args.join(" ");
    if (joined.includes("-rf")) {
      terminal.printSpans([{ text: "Good try.\n" }]);
      return;
    }
    terminal.printError("rm: command not supported");
  };
}
