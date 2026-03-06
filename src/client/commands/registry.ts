import type { Terminal } from "../terminal/Terminal.ts";

export interface CommandContext {
  terminal: Terminal;
  args: string[];
}

export type CommandHandler = (ctx: CommandContext) => Promise<void>;

interface CommandEntry {
  handler: CommandHandler;
  description: string;
}

const CHAINING_PATTERNS = /[|&;]/;

export class CommandRegistry {
  private commands = new Map<string, CommandEntry>();

  register(name: string, description: string, handler: CommandHandler): void {
    this.commands.set(name, { handler, description });
  }

  getCommandNames(): string[] {
    return [...this.commands.keys()];
  }

  getCommands(): Map<string, CommandEntry> {
    return this.commands;
  }

  async execute(raw: string, terminal: Terminal): Promise<void> {
    if (CHAINING_PATTERNS.test(raw)) {
      terminal.printError("Command chaining is not supported.");
      return;
    }

    const parts = raw.split(/\s+/).filter(Boolean);
    const name = parts[0];
    const args = parts.slice(1);

    if (!name) return;

    const entry = this.commands.get(name);
    if (!entry) {
      terminal.printError(`bash: ${name}: command not found`);
      return;
    }

    await entry.handler({ terminal, args });
  }
}
