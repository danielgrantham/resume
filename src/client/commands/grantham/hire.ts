import type { Terminal } from '../../terminal/Terminal.ts'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function granthamHire(terminal: Terminal): Promise<void> {
	const company = await terminal.promptInline('Company: ')
	if (company === '\x03' || !company.trim()) {
		terminal.printSpans([{ text: 'Cancelled.\n' }])
		return
	}

	let email = ''
	while (true) {
		email = await terminal.promptInline('Contact Email: ')
		if (email === '\x03') {
			terminal.printSpans([{ text: 'Cancelled.\n' }])
			return
		}
		if (EMAIL_REGEX.test(email.trim())) {
			email = email.trim()
			break
		}
		terminal.printSpans([{ text: 'Invalid email format. Please try again.\n', className: 'ansi-red' }])
	}

	try {
		const resp = await fetch('/api/hire', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ company: company.trim(), email })
		})

		if (resp.status === 429) {
			terminal.printSpans([{ text: '\nToo many requests. Please try again later.\n', className: 'ansi-red' }])
			return
		}

		if (!resp.ok) {
			const data = (await resp.json().catch(() => null)) as { error?: string } | null
			terminal.printError(`\nError: ${data?.error ?? 'Something went wrong.'}`)
			return
		}

		terminal.printSpans([{ text: '\nDaniel will contact you ASAP to follow up.\n', className: 'ansi-green' }])
	} catch {
		terminal.printError('\nError: Unable to reach server. Please try again.')
	}
}
