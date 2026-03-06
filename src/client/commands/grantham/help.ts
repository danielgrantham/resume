import type { Terminal } from "../../terminal/Terminal.ts";

const HELP_TEXT = `Usage: grantham [OPTIONS]

Options:
  -h, --help          Show this help message
  -a, --about         Display bio and summary
  -x, --experience    Display professional experience
  -s, --skills        Display technical skills
  -c, --contact       Display contact information
  -r, --resume        Download resume as PDF
      --hire          Start the hire inquiry flow
`;

export async function granthamHelp(terminal: Terminal): Promise<void> {
  terminal.dismissGhostText();
  await terminal.streamSpans([{ text: HELP_TEXT }]);
}
