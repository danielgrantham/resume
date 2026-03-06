import type { CommandHandler, CommandRegistry } from "../registry.ts";

export function createMan(registry: CommandRegistry): CommandHandler {
  return async (ctx) => {
    const page = ctx.args[0];
    if (page === "grantham") {
      const granthamCmd = registry.getCommands().get("grantham");
      if (granthamCmd) {
        await granthamCmd.handler({ terminal: ctx.terminal, args: ["--help"] });
        return;
      }
    }
    if (!page) {
      ctx.terminal.printError("What manual page do you want?");
      return;
    }
    ctx.terminal.printError(`No manual entry for ${page}`);
  };
}
