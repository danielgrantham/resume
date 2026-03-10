import type { CommandHandler } from '../registry.ts'
import type { FileSystem } from '../../filesystem/FileSystem.ts'

export function createCd(fs: FileSystem): CommandHandler {
	return async ({ terminal, args }) => {
		const result = fs.cd(args[0])
		if (result.error) {
			terminal.printError(result.error)
		}
	}
}
