import type { CommandHandler, CommandRegistry } from "../registry.ts";

export function createHelp(registry: CommandRegistry): CommandHandler {
  return async ({ terminal }) => {
    const commands = registry.getCommands();
    const lines: string[] = ["Available commands:\n\n"];

    for (const [name, entry] of commands) {
      lines.push(`  ${name.padEnd(14)} ${entry.description}\n`);
    }

    lines.push("\nType `grantham --help` for portfolio commands.\n");
    terminal.printSpans([{ text: lines.join("") }]);
  };
}
