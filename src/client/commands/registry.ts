import type { Terminal } from '../terminal/Terminal.ts'

export interface CommandContext {
	terminal: Terminal
	args: string[]
}

export type CommandHandler = (ctx: CommandContext) => Promise<void>

export interface CommandEntry {
	handler: CommandHandler
	description: string
	hidden?: boolean
}

export interface CommandRegistry {
	register(name: string, description: string, handler: CommandHandler, hidden?: boolean): void
	getCommandNames(): string[]
	getCommands(): Map<string, CommandEntry>
	execute(raw: string, terminal: Terminal): Promise<void>
}

const CHAINING_PATTERNS = /[|&;]/

export function createCommandRegistry(): CommandRegistry {
	const commands = new Map<string, CommandEntry>()

	return {
		register(name: string, description: string, handler: CommandHandler, hidden = false): void {
			commands.set(name, { handler, description, hidden })
		},

		getCommandNames(): string[] {
			return [...commands.keys()]
		},

		getCommands(): Map<string, CommandEntry> {
			return new Map([...commands].filter(([, e]) => !e.hidden))
		},

		async execute(raw: string, terminal: Terminal): Promise<void> {
			if (CHAINING_PATTERNS.test(raw)) {
				terminal.printError('Command chaining is not supported.')
				return
			}

			let parts = raw.split(/\s+/).filter(Boolean)

			if (parts[0] === 'sudo') {
				parts = parts.slice(1)
				if (!parts.length) {
					terminal.printSpans([{ text: 'usage: sudo [-h] command [arg ...]\n' }])
					return
				}
			}

			const name = parts[0]
			const args = parts.slice(1)

			if (!name) return

			const entry = commands.get(name)
			if (!entry) {
				terminal.printError(`bash: ${name}: command not found`)
				return
			}

			await entry.handler({ terminal, args })
		}
	}
}
