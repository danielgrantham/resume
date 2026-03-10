export interface StyledSpan {
	text: string
	className?: string
	href?: string
	bold?: boolean
}

export interface OutputRenderer {
	readonly isStreaming: boolean
	setSpeed(ms: number): void
	print(spans: StyledSpan[]): void
	printRaw(html: HTMLElement): void
	stream(spans: StyledSpan[], speed?: number): Promise<void>
	clear(): void
}

function createSpanElement(span: StyledSpan): HTMLElement {
	if (span.href) {
		const a = document.createElement('a')
		a.href = span.href
		a.target = '_blank'
		a.rel = 'noopener noreferrer'
		a.className = 'terminal-link'
		a.textContent = span.text
		return a
	}

	const el = document.createElement('span')
	el.textContent = span.text
	const classes: string[] = []
	if (span.className) classes.push(span.className)
	if (span.bold) classes.push('ansi-bold')
	if (classes.length) el.className = classes.join(' ')
	return el
}

function createLine(spans: StyledSpan[]): HTMLDivElement {
	const div = document.createElement('div')
	for (const span of spans) {
		div.appendChild(createSpanElement(span))
	}
	return div
}

function splitIntoLines(spans: StyledSpan[]): StyledSpan[][] {
	const lines: StyledSpan[][] = []
	let current: StyledSpan[] = []

	for (const span of spans) {
		const parts = span.text.split('\n')
		for (let i = 0; i < parts.length; i++) {
			if (i > 0) {
				lines.push(current)
				current = []
			}
			const text = parts[i]!
			if (text.length > 0) {
				current.push({ ...span, text })
			}
		}
	}

	if (current.length > 0 || lines.length === 0) {
		lines.push(current)
	}

	return lines
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createOutputRenderer(outputEl: HTMLElement): OutputRenderer {
	let streaming = false
	let streamSpeed = 30

	function scrollToBottom(): void {
		const terminal = outputEl.parentElement
		if (terminal) {
			terminal.scrollTop = terminal.scrollHeight
		}
	}

	return {
		get isStreaming(): boolean {
			return streaming
		},

		setSpeed(ms: number): void {
			streamSpeed = ms
		},

		print(spans: StyledSpan[]): void {
			const line = createLine(spans)
			outputEl.appendChild(line)
			scrollToBottom()
		},

		printRaw(html: HTMLElement): void {
			outputEl.appendChild(html)
			scrollToBottom()
		},

		async stream(spans: StyledSpan[], speed?: number): Promise<void> {
			streaming = true
			const interval = speed ?? streamSpeed
			const lines = splitIntoLines(spans)
			const container = document.createElement('div')
			outputEl.appendChild(container)

			for (let i = 0; i < lines.length; i++) {
				const lineDiv = document.createElement('div')
				const lineSpans = lines[i]!
				if (lineSpans.length === 0) {
					lineDiv.appendChild(document.createTextNode('\u200b'))
				} else {
					for (const span of lineSpans) {
						lineDiv.appendChild(createSpanElement(span))
					}
				}
				container.appendChild(lineDiv)
				scrollToBottom()

				if (interval > 0 && i < lines.length - 1) {
					await delay(interval)
				}
			}

			streaming = false
		},

		clear(): void {
			outputEl.innerHTML = ''
		}
	}
}
