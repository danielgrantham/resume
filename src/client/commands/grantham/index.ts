import type { CommandHandler } from "../registry.ts";
import type { FileSystem } from "../../filesystem/FileSystem.ts";
import { granthamHelp } from "./help.ts";
import { granthamAbout } from "./about.ts";
import { granthamExperience } from "./experience.ts";
import { granthamSkills } from "./skills.ts";
import { granthamContact } from "./contact.ts";
import { granthamResume } from "./resume.ts";
import { granthamHire } from "./hire.ts";

export function createGrantham(fs: FileSystem): CommandHandler {
  return async ({ terminal, args }) => {
    const flag = args[0];

    if (!flag || flag === "--help" || flag === "-h") {
      await granthamHelp(terminal);
      return;
    }

    switch (flag) {
      case "--about":
      case "-a":
        await granthamAbout(terminal, fs);
        break;
      case "--experience":
      case "-x":
        await granthamExperience(terminal, fs);
        break;
      case "--skills":
      case "-s":
        await granthamSkills(terminal, fs);
        break;
      case "--contact":
      case "-c":
        await granthamContact(terminal, fs);
        break;
      case "--resume":
      case "-r":
        await granthamResume(terminal);
        break;
      case "--hire":
        await granthamHire(terminal);
        break;
      default:
        terminal.printError(
          `grantham: unknown option '${flag}'. Try 'grantham --help'.`
        );
    }
  };
}
