import { Terminal } from "./terminal/Terminal.ts";
import { FileSystem } from "./filesystem/FileSystem.ts";
import { CommandRegistry } from "./commands/registry.ts";
import { createLs } from "./commands/bash/ls.ts";
import { createCat } from "./commands/bash/cat.ts";
import { createCd } from "./commands/bash/cd.ts";
import { createPwd } from "./commands/bash/pwd.ts";
import { createClear } from "./commands/bash/clear.ts";
import { createEcho } from "./commands/bash/echo.ts";
import { createWhoami } from "./commands/bash/whoami.ts";
import { createHistory } from "./commands/bash/history.ts";
import { createHelp } from "./commands/bash/help.ts";
import { createMan } from "./commands/bash/man.ts";
import { createRm } from "./commands/bash/rm.ts";
import { createGrantham } from "./commands/grantham/index.ts";

function boot(): void {
  const container = document.getElementById("terminal-container");
  if (!container) throw new Error("Missing #terminal-container");

  const fs = new FileSystem();
  const terminal = new Terminal(container, fs);

  const registry = new CommandRegistry();

  registry.register("ls", "List directory contents", createLs(fs));
  registry.register("cat", "Display file contents", createCat(fs));
  registry.register("cd", "Change directory", createCd(fs));
  registry.register("pwd", "Print working directory", createPwd(fs));
  registry.register("clear", "Clear the terminal", createClear());
  registry.register("echo", "Print text to terminal", createEcho());
  registry.register("whoami", "Print current user", createWhoami());
  registry.register("history", "Show command history", createHistory());
  registry.register("help", "List available commands", createHelp(registry));
  registry.register("man", "Display manual page", createMan(registry));
  registry.register("rm", "Remove files", createRm(), true);
  const grantham = createGrantham(fs);
  registry.register("grantham", "Portfolio commands (try --help)", grantham);
  registry.register("about", "Alias for grantham --about", async (ctx) => {
    await grantham({ terminal: ctx.terminal, args: ["--about"] });
  });
  registry.register("experience", "Alias for grantham --experience", async (ctx) => {
    await grantham({ terminal: ctx.terminal, args: ["--experience"] });
  });
  registry.register("skills", "Alias for grantham --skills", async (ctx) => {
    await grantham({ terminal: ctx.terminal, args: ["--skills"] });
  });
  registry.register("contact", "Alias for grantham --contact", async (ctx) => {
    await grantham({ terminal: ctx.terminal, args: ["--contact"] });
  });
  registry.register("resume", "Alias for grantham --resume", async (ctx) => {
    await grantham({ terminal: ctx.terminal, args: ["--resume"] });
  });
  registry.register("hire", "Alias for grantham --hire", async (ctx) => {
    await grantham({ terminal: ctx.terminal, args: ["--hire"] });
  });
  terminal.setRegistry(registry);
}

document.addEventListener("DOMContentLoaded", boot);
