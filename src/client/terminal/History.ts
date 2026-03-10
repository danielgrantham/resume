export interface History {
	push(command: string): void
	prev(): string | null
	next(): string | null
	getAll(): string[]
	resetCursor(): void
}

export function createHistory(): History {
	const entries: string[] = []
	let cursor = -1

	return {
		push(command: string): void {
			if (command.trim()) {
				entries.push(command)
			}
			cursor = entries.length
		},

		prev(): string | null {
			if (cursor > 0) {
				cursor--
				return entries[cursor] ?? null
			}
			return entries[0] ?? null
		},

		next(): string | null {
			if (cursor < entries.length - 1) {
				cursor++
				return entries[cursor] ?? null
			}
			cursor = entries.length
			return null
		},

		getAll(): string[] {
			return [...entries]
		},

		resetCursor(): void {
			cursor = entries.length
		}
	}
}
