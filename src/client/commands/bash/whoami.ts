import type { CommandHandler } from "../registry.ts";

export function createWhoami(): CommandHandler {
  return async ({ terminal }) => {
    terminal.printSpans([{ text: "Daniel Grantham\n" }]);
  };
}
