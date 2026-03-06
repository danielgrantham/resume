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
  registry.register("rm", "Remove files", createRm());
  registry.register("grantham", "Portfolio commands (try --help)", createGrantham(fs));
  registry.register("sudo", "Superuser command", async ({ terminal: t }) => {
    t.printError("bash: sudo: command not found");
  });

  terminal.setRegistry(registry);
}

document.addEventListener("DOMContentLoaded", boot);
