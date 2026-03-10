import type { Terminal } from '../../terminal/Terminal.ts'

export async function granthamResume(terminal: Terminal): Promise<void> {
	const answer = await terminal.promptInline('Download resume? [Y/n]: ')

	if (answer === '\x03') return

	const normalized = answer.trim().toLowerCase()
	if (normalized === '' || normalized === 'y') {
		const link = document.createElement('a')
		link.href = '/api/resume'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		terminal.printSpans([{ text: 'Downloading resume.pdf...\n' }])
		return
	}

	if (normalized === 'n') {
		terminal.printSpans([{ text: 'Download cancelled.\n' }])
		return
	}

	terminal.printSpans([{ text: 'Download cancelled.\n' }])
}
