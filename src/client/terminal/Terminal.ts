import { createHistory, type History } from './History.ts'
import { createOutputRenderer, type OutputRenderer, type StyledSpan } from './OutputRenderer.ts'
import { createInputHandler, type InputHandler } from './InputHandler.ts'
import { createTabComplete, type TabComplete } from './TabComplete.ts'
import type { FileSystem } from '../filesystem/FileSystem.ts'
import type { CommandRegistry } from '../commands/registry.ts'

export type { StyledSpan }

export interface Terminal {
	readonly history: History
	readonly renderer: OutputRenderer
	readonly inputHandler: InputHandler
	readonly tabComplete: TabComplete
	setRegistry(registry: CommandRegistry): void
	dismissGhostText(): void
	freezePromptAndInput(inputText: string): void
	printError(message: string): void
	printSpans(spans: StyledSpan[]): void
	streamSpans(spans: StyledSpan[]): Promise<void>
	prompt(question: string): Promise<string>
	promptInline(question: string): Promise<string>
}

export function createTerminal(container: HTMLElement, fs: FileSystem): Terminal {
	let registry: CommandRegistry | null = null
	let ghostEl: HTMLDivElement | null = null
	let ghostDismissed = false

	const terminalEl = document.createElement('div')
	terminalEl.id = 'terminal'

	const outputEl = document.createElement('div')
	outputEl.id = 'terminal-output'

	const promptLineEl = document.createElement('div')
	promptLineEl.className = 'prompt-line'

	const inputLineEl = document.createElement('div')
	inputLineEl.className = 'input-line'

	const dollarEl = document.createElement('span')
	dollarEl.className = 'prompt-dollar'
	dollarEl.textContent = '$'

	const inputTextEl = document.createElement('span')
	inputTextEl.className = 'input-text'

	const cursorEl = document.createElement('span')
	cursorEl.className = 'cursor'

	const hiddenInput = document.createElement('input')
	hiddenInput.id = 'hidden-input'
	hiddenInput.type = 'text'
	hiddenInput.autocapitalize = 'none'
	hiddenInput.autocomplete = 'off'
	hiddenInput.spellcheck = false

	inputLineEl.appendChild(dollarEl)
	inputLineEl.appendChild(inputTextEl)
	inputLineEl.appendChild(cursorEl)

	terminalEl.appendChild(outputEl)
	terminalEl.appendChild(promptLineEl)
	terminalEl.appendChild(inputLineEl)
	terminalEl.appendChild(hiddenInput)

	container.appendChild(terminalEl)

	const history = createHistory()
	const renderer = createOutputRenderer(outputEl)
	const tabComplete = createTabComplete()

	function scrollToBottom(): void {
		terminalEl.scrollTop = terminalEl.scrollHeight
	}

	function renderPrompt(): void {
		promptLineEl.innerHTML = ''
		promptLineEl.style.display = ''
		dollarEl.style.display = ''
		const hasPrevious = !!outputEl.querySelector('.prompt-line')
		promptLineEl.className = hasPrevious ? 'prompt-line prompt-spaced' : 'prompt-line'
		const cwd = fs.getCwdDisplay()

		const spans: { text: string; className: string }[] = [
			{ text: 'user@GRANTHAM-TERMINAL', className: 'prompt-user' },
			{ text: 'BASH', className: 'prompt-shell' },
			{ text: cwd, className: 'prompt-cwd' }
		]

		for (const s of spans) {
			const el = document.createElement('span')
			el.textContent = s.text
			el.className = s.className
			promptLineEl.appendChild(el)
		}
	}

	function showGhostText(): void {
		ghostEl = document.createElement('div')
		ghostEl.className = 'ghost-text'
		ghostEl.textContent = 'Type `grantham --help` to get started'
		outputEl.appendChild(ghostEl)
	}

	function freezePromptAndInput(inputText: string): void {
		const isFirst = !outputEl.querySelector('.prompt-line')
		const promptDiv = document.createElement('div')
		promptDiv.className = isFirst ? 'prompt-line' : 'prompt-line prompt-spaced'
		promptDiv.innerHTML = promptLineEl.innerHTML
		outputEl.appendChild(promptDiv)

		const inputDiv = document.createElement('div')
		inputDiv.className = 'input-line'
		const dollar = document.createElement('span')
		dollar.className = 'prompt-dollar'
		dollar.textContent = '$'
		inputDiv.appendChild(dollar)
		const inputSpan = document.createElement('span')
		inputSpan.textContent = inputText
		inputDiv.appendChild(inputSpan)
		outputEl.appendChild(inputDiv)
	}

	function freezeInputOnly(text: string): void {
		const div = document.createElement('div')
		div.textContent = text
		outputEl.appendChild(div)
	}

	async function executeCommand(raw: string): Promise<void> {
		if (raw === '\x03') {
			freezePromptAndInput('')
			renderPrompt()
			return
		}

		freezePromptAndInput(raw)
		inputHandler.disable()

		if (raw.trim()) {
			await registry?.execute(raw.trim(), terminal)
		}

		renderPrompt()
		inputHandler.enable()
		inputHandler.setInput('')
		scrollToBottom()
		inputHandler.focus()
	}

	const inputHandler = createInputHandler({
		inputEl: inputTextEl,
		cursorEl,
		hiddenInput,
		history,
		tabComplete,
		renderer,
		fs,
		onCommand: (raw) => executeCommand(raw),
		onScroll: () => scrollToBottom()
	})

	terminalEl.addEventListener('click', () => inputHandler.focus())
	renderPrompt()
	showGhostText()
	requestAnimationFrame(() => inputHandler.focus())

	const terminal: Terminal = {
		history,
		renderer,
		inputHandler,
		tabComplete,

		setRegistry(reg: CommandRegistry): void {
			registry = reg
			tabComplete.setCommands(reg.getCommandNames())
		},

		dismissGhostText(): void {
			if (ghostEl && !ghostDismissed) {
				ghostDismissed = true
				ghostEl.remove()
				ghostEl = null
			}
		},

		freezePromptAndInput,

		printError(message: string): void {
			renderer.print([{ text: message, className: 'ansi-red' }])
		},

		printSpans(spans: StyledSpan[]): void {
			renderer.print(spans)
		},

		async streamSpans(spans: StyledSpan[]): Promise<void> {
			await renderer.stream(spans)
		},

		prompt(question: string): Promise<string> {
			return new Promise((resolve) => {
				renderer.print([{ text: question }])
				inputHandler.setInput('')
				inputHandler.setPromptHandler((value) => {
					freezeInputOnly(value)
					inputHandler.setPromptHandler(null)
					resolve(value)
				})
			})
		},

		promptInline(question: string): Promise<string> {
			return new Promise((resolve) => {
				promptLineEl.style.display = 'none'
				dollarEl.style.display = 'none'

				const label = document.createElement('span')
				label.textContent = question
				inputLineEl.insertBefore(label, dollarEl)
				inputTextEl.classList.add('inline-prompt')

				inputHandler.setInput('')
				inputHandler.enable()
				scrollToBottom()
				inputHandler.focus()

				inputHandler.setPromptHandler((value) => {
					const frozenLine = document.createElement('div')
					const frozenLabel = document.createElement('span')
					frozenLabel.textContent = question
					frozenLine.appendChild(frozenLabel)
					const frozenValue = document.createElement('span')
					frozenValue.textContent = value
					frozenLine.appendChild(frozenValue)
					outputEl.appendChild(frozenLine)

					label.remove()
					inputTextEl.classList.remove('inline-prompt')
					inputHandler.setPromptHandler(null)
					inputHandler.setInput('')
					inputHandler.disable()
					resolve(value)
				})
			})
		}
	}

	return terminal
}
