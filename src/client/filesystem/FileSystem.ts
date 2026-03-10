import type { FileNode, DirEntry } from './types.ts'

export interface FileSystem {
	getCwd(): string
	getCwdDisplay(): string
	pwd(): string
	listCurrentDir(): DirEntry[]
	ls(path?: string): { entries: DirEntry[] } | { error: string }
	cd(path?: string): { error?: string }
	cat(path: string): Promise<{ content: string } | { error: string }>
	fetchContent(contentFile: string): Promise<string | null>
}

function buildTree(): FileNode {
	return {
		name: '/',
		type: 'directory',
		children: [
			{
				name: 'home',
				type: 'directory',
				children: [
					{
						name: 'user',
						type: 'directory',
						children: [
							{ name: 'about.md', type: 'file', contentUrl: '/content/about.md' },
							{ name: 'experience.md', type: 'file', contentUrl: '/content/experience.md' },
							{ name: 'skills.md', type: 'file', contentUrl: '/content/skills.md' },
							{ name: 'contact.md', type: 'file', contentUrl: '/content/contact.md' },
							{ name: 'resume.pdf', type: 'file' }
						]
					}
				]
			}
		]
	}
}

function resolveNode(root: FileNode, segments: string[]): FileNode | null {
	let current: FileNode = root
	for (const seg of segments) {
		if (current.type !== 'directory' || !current.children) return null
		const child = current.children.find((c) => c.name === seg)
		if (!child) return null
		current = child
	}
	return current
}

function resolveSegments(cwdPath: string[], path: string): string[] {
	if (path.startsWith('/')) {
		return path.split('/').filter(Boolean)
	}
	if (path.startsWith('~/')) {
		return ['home', 'user', ...path.slice(2).split('/').filter(Boolean)]
	}

	const segments = [...cwdPath]
	const parts = path.split('/').filter(Boolean)
	for (const part of parts) {
		if (part === '..') {
			if (segments.length > 0) segments.pop()
		} else if (part !== '.') {
			segments.push(part)
		}
	}
	return segments
}

function resolveFromCwd(root: FileNode, cwdPath: string[], path?: string): FileNode | null {
	if (!path) return resolveNode(root, cwdPath)
	const segments = resolveSegments(cwdPath, path)
	return resolveNode(root, segments)
}

export function createFileSystem(): FileSystem {
	const root = buildTree()
	let cwdPath = ['home', 'user']

	return {
		getCwd(): string {
			return '/' + cwdPath.join('/')
		},

		getCwdDisplay(): string {
			const cwd = '/' + cwdPath.join('/')
			if (cwd === '/home/user') return '~'
			if (cwd.startsWith('/home/user/')) return '~' + cwd.slice('/home/user'.length)
			return cwd
		},

		pwd(): string {
			return '/' + cwdPath.join('/')
		},

		listCurrentDir(): DirEntry[] {
			const node = resolveNode(root, cwdPath)
			if (!node || node.type !== 'directory' || !node.children) return []
			return node.children.map((c) => ({ name: c.name, type: c.type }))
		},

		ls(path?: string): { entries: DirEntry[] } | { error: string } {
			const node = resolveFromCwd(root, cwdPath, path)
			if (!node) {
				return { error: `ls: cannot access '${path}': No such file or directory` }
			}
			if (node.type !== 'directory') {
				return { entries: [{ name: node.name, type: node.type }] }
			}
			if (!node.children) return { entries: [] }
			return {
				entries: node.children.map((c) => ({ name: c.name, type: c.type }))
			}
		},

		cd(path?: string): { error?: string } {
			if (!path || path === '~') {
				cwdPath = ['home', 'user']
				return {}
			}
			if (path === '..') {
				if (cwdPath.length > 0) {
					cwdPath.pop()
				}
				return {}
			}
			if (path.startsWith('~/')) {
				path = '/home/user/' + path.slice(2)
			}

			const targetSegments = resolveSegments(cwdPath, path)
			const node = resolveNode(root, targetSegments)

			if (!node) {
				return { error: `bash: cd: ${path}: No such file or directory` }
			}
			if (node.type !== 'directory') {
				return { error: `bash: cd: ${path}: Not a directory` }
			}

			cwdPath = targetSegments
			return {}
		},

		async cat(path: string): Promise<{ content: string } | { error: string }> {
			const node = resolveFromCwd(root, cwdPath, path)
			if (!node) {
				return { error: `cat: ${path}: No such file or directory` }
			}
			if (node.type === 'directory') {
				return { error: `cat: ${path}: Is a directory` }
			}
			if (!node.contentUrl) {
				return { error: `cat: ${path}: Permission denied` }
			}
			if (node.cachedContent !== undefined) {
				return { content: node.cachedContent }
			}
			try {
				const resp = await fetch(node.contentUrl)
				if (!resp.ok) throw new Error('fetch failed')
				const text = await resp.text()
				node.cachedContent = text
				return { content: text }
			} catch {
				return { error: `cat: ${path}: Unable to read file` }
			}
		},

		async fetchContent(contentFile: string): Promise<string | null> {
			const url = `/content/${contentFile}`
			try {
				const resp = await fetch(url)
				if (!resp.ok) return null
				return await resp.text()
			} catch {
				return null
			}
		}
	}
}
