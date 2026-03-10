import { Database } from 'bun:sqlite'
import { mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'

const dbPath = process.env['DATABASE_PATH'] ?? './data/grantham.db'

const dir = dirname(dbPath)
if (!existsSync(dir)) {
	mkdirSync(dir, { recursive: true })
}

const db = new Database(dbPath, { create: true })

db.run(`
  CREATE TABLE IF NOT EXISTS hire_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    ip TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    email_sent INTEGER NOT NULL DEFAULT 0
  )
`)

export function insertInquiry(company: string, email: string, ip: string): number {
	const stmt = db.prepare('INSERT INTO hire_inquiries (company, email, ip) VALUES (?, ?, ?)')
	const result = stmt.run(company, email, ip)
	return Number(result.lastInsertRowid)
}

export function markEmailSent(id: number): void {
	db.prepare('UPDATE hire_inquiries SET email_sent = 1 WHERE id = ?').run(id)
}

export function countRecentInquiries(ip: string): number {
	const row = db
		.prepare("SELECT COUNT(*) as cnt FROM hire_inquiries WHERE ip = ? AND created_at > datetime('now', '-1 hour')")
		.get(ip) as { cnt: number } | null
	return row?.cnt ?? 0
}

export default db
