import type { CommandHandler } from '../registry.ts'

export function createClear(): CommandHandler {
	return async ({ terminal }) => {
		terminal.renderer.clear()
	}
}
