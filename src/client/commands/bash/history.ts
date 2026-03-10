import type { CommandHandler } from '../registry.ts'

export function createHistory(): CommandHandler {
	return async ({ terminal }) => {
		const entries = terminal.history.getAll()
		const lines = entries.map((cmd, i) => `    ${String(i + 1).padStart(4)}  ${cmd}\n`)
		if (lines.length) {
			terminal.printSpans([{ text: lines.join('') }])
		}
	}
}
