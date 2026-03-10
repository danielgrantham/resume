import type { CommandHandler } from '../registry.ts'
import type { FileSystem } from '../../filesystem/FileSystem.ts'
import { renderMarkdown } from '../../terminal/MarkdownRenderer.ts'

export function createCat(fs: FileSystem): CommandHandler {
	return async ({ terminal, args }) => {
		const file = args[0]
		if (!file) {
			terminal.printError('cat: missing file operand')
			return
		}

		const result = await fs.cat(file)

		if ('error' in result) {
			terminal.printError(result.error)
			return
		}

		const spans = renderMarkdown(result.content)
		await terminal.streamSpans(spans)
	}
}
