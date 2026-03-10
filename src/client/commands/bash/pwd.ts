import type { CommandHandler } from '../registry.ts'
import type { FileSystem } from '../../filesystem/FileSystem.ts'

export function createPwd(fs: FileSystem): CommandHandler {
	return async ({ terminal }) => {
		terminal.printSpans([{ text: fs.pwd() + '\n' }])
	}
}
