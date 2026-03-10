import type { CommandHandler } from '../registry.ts'

export function createEcho(): CommandHandler {
	return async ({ terminal, args }) => {
		terminal.printSpans([{ text: args.join(' ') + '\n' }])
	}
}
