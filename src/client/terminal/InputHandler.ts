import type { History } from './History.ts'
import type { TabComplete } from './TabComplete.ts'
import type { OutputRenderer } from './OutputRenderer.ts'
import type { FileSystem } from '../filesystem/FileSystem.ts'

export type CommandExecutor = (raw: string) => Promise<void>

export interface InputHandler {
	focus(): void
	setInput(text: string): void
	getInput(): string
	setPromptHandler(handler: ((value: string) => void) | null): void
	disable(): void
	enable(): void
}

export function createInputHandler(opts: {
	inputEl: HTMLSpanElement
	cursorEl: HTMLSpanElement
	hiddenInput: HTMLInputElement
	history: History
	tabComplete: TabComplete
	renderer: OutputRenderer
	fs: FileSystem
	onCommand: CommandExecutor
	onScroll: () => void
}): InputHandler {
	const { inputEl, cursorEl, hiddenInput, history, tabComplete, renderer, fs, onCommand, onScroll } = opts
	let currentInput = ''
	let promptHandler: ((value: string) => void) | null = null

	function render(): void {
		inputEl.textContent = currentInput
	}

	function handleKeyDown(e: KeyboardEvent): void {
		if (renderer.isStreaming) {
			e.preventDefault()
			return
		}

		onScroll()

		if (e.key === 'Enter') {
			e.preventDefault()
			const value = currentInput
			currentInput = ''
			render()

			if (promptHandler) {
				promptHandler(value)
			} else {
				history.push(value)
				onCommand(value)
			}
			return
		}

		if (e.key === 'Backspace') {
			e.preventDefault()
			currentInput = currentInput.slice(0, -1)
			render()
			return
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault()
			if (promptHandler) return
			const prev = history.prev()
			if (prev !== null) {
				currentInput = prev
				render()
			}
			return
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault()
			if (promptHandler) return
			const next = history.next()
			currentInput = next ?? ''
			render()
			return
		}

		if (e.key === 'Tab') {
			e.preventDefault()
			if (promptHandler) return
			const result = tabComplete.complete(currentInput, fs)
			if (result.options) {
				renderer.print([{ text: result.options.join('  ') }])
			}
			currentInput = result.completed
			render()
			return
		}

		if (e.ctrlKey && e.key === 'c') {
			e.preventDefault()
			if (promptHandler) {
				promptHandler('\x03')
				return
			}
			renderer.print([{ text: currentInput + '^C' }])
			currentInput = ''
			render()
			onCommand('\x03')
			return
		}

		if (e.ctrlKey && e.key === 'l') {
			e.preventDefault()
			renderer.clear()
			return
		}

		if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault()
			currentInput += e.key
			render()
			return
		}
	}

	function handleInput(): void {
		if (renderer.isStreaming) {
			hiddenInput.value = ''
			return
		}
		onScroll()
		const value = hiddenInput.value
		if (value) {
			currentInput += value
			hiddenInput.value = ''
			render()
		}
	}

	hiddenInput.addEventListener('keydown', handleKeyDown)
	hiddenInput.addEventListener('input', handleInput)

	return {
		focus(): void {
			hiddenInput.focus({ preventScroll: true })
		},

		setInput(text: string): void {
			currentInput = text
			render()
		},

		getInput(): string {
			return currentInput
		},

		setPromptHandler(handler: ((value: string) => void) | null): void {
			promptHandler = handler
		},

		disable(): void {
			cursorEl.style.display = 'none'
		},

		enable(): void {
			cursorEl.style.display = ''
		}
	}
}
