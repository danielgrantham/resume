import type { Terminal } from '../../terminal/Terminal.ts'
import type { FileSystem } from '../../filesystem/FileSystem.ts'
import { renderMarkdown } from '../../terminal/MarkdownRenderer.ts'

export async function granthamContact(terminal: Terminal, fs: FileSystem): Promise<void> {
	const content = await fs.fetchContent('contact.md')
	if (!content) {
		terminal.printError('Error: Unable to load content.')
		return
	}
	await terminal.streamSpans(renderMarkdown(content))
}
