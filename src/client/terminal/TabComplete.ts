import type { FileSystem } from '../filesystem/FileSystem.ts'

export interface TabComplete {
	setCommands(names: string[]): void
	complete(input: string, fs: FileSystem): { completed: string; options: string[] | null }
}

function commonPrefix(strs: string[]): string {
	if (!strs.length) return ''
	let prefix = strs[0]!
	for (let i = 1; i < strs.length; i++) {
		while (!strs[i]!.startsWith(prefix)) {
			prefix = prefix.slice(0, -1)
		}
	}
	return prefix
}

export function createTabComplete(): TabComplete {
	let commandNames: string[] = []
	const granthamFlags: string[] = [
		'--help',
		'-h',
		'--about',
		'-a',
		'--experience',
		'-x',
		'--skills',
		'-s',
		'--contact',
		'-c',
		'--resume',
		'-r',
		'--hire'
	]
	let lastTabInput = ''
	let tabCount = 0

	function completeCommand(partial: string): { completed: string; options: string[] | null } {
		const matches = commandNames.filter((n) => n.startsWith(partial))
		if (matches.length === 1) {
			return { completed: matches[0]! + ' ', options: null }
		}
		if (matches.length > 1 && tabCount >= 2) {
			return { completed: partial, options: matches }
		}
		const common = commonPrefix(matches)
		return { completed: common || partial, options: null }
	}

	function completeFlag(fullInput: string, partial: string): { completed: string; options: string[] | null } {
		const longFlags = granthamFlags.filter((f) => f.startsWith('--'))
		const matches = longFlags.filter((f) => f.startsWith(partial))
		const prefix = fullInput.slice(0, fullInput.length - partial.length)

		if (matches.length === 1) {
			return { completed: prefix + matches[0]!, options: null }
		}
		if (matches.length > 1 && tabCount >= 2) {
			return { completed: fullInput, options: matches }
		}
		const common = commonPrefix(matches)
		if (common.length > partial.length) {
			return { completed: prefix + common, options: null }
		}
		return { completed: fullInput, options: null }
	}

	function completeFilename(
		fullInput: string,
		partial: string,
		fs: FileSystem,
		dirsOnly: boolean
	): { completed: string; options: string[] | null } {
		const entries = fs.listCurrentDir()
		let candidates = entries.map((e) => (e.type === 'directory' ? e.name + '/' : e.name))
		if (dirsOnly) {
			candidates = entries.filter((e) => e.type === 'directory').map((e) => e.name + '/')
		}
		const matches = candidates.filter((n) => n.startsWith(partial))
		const prefix = fullInput.slice(0, fullInput.length - partial.length)

		if (matches.length === 1) {
			return { completed: prefix + matches[0]!, options: null }
		}
		if (matches.length > 1 && tabCount >= 2) {
			return { completed: fullInput, options: matches }
		}
		const common = commonPrefix(matches)
		if (common.length > partial.length) {
			return { completed: prefix + common, options: null }
		}
		return { completed: fullInput, options: null }
	}

	return {
		setCommands(names: string[]): void {
			commandNames = names
		},

		complete(input: string, fs: FileSystem): { completed: string; options: string[] | null } {
			if (input !== lastTabInput) {
				lastTabInput = input
				tabCount = 0
			}
			tabCount++

			const parts = input.split(/\s+/)
			const command = parts[0] ?? ''
			const argPart = parts.length > 1 ? (parts[parts.length - 1] ?? '') : null

			if (argPart === null) {
				return completeCommand(command)
			}

			if (command === 'grantham' && argPart.startsWith('-')) {
				return completeFlag(input, argPart)
			}

			if (command === 'cat' || command === 'cd' || command === 'ls') {
				return completeFilename(input, argPart, fs, command === 'cd')
			}

			return { completed: input, options: null }
		}
	}
}
