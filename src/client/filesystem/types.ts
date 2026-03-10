export interface FileNode {
	name: string
	type: 'file' | 'directory'
	contentUrl?: string
	children?: FileNode[]
	cachedContent?: string
}

export interface DirEntry {
	name: string
	type: 'file' | 'directory'
}
