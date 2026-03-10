import { Resend } from 'resend'

let resend: Resend | null = null

function getClient(): Resend | null {
	const key = process.env['RESEND_API_KEY']
	if (!key) return null
	if (!resend) {
		resend = new Resend(key)
	}
	return resend
}

const notificationEmail = process.env['NOTIFICATION_EMAIL'] ?? 'daniel@dgrantham.com'

export async function sendHireNotification(company: string, email: string, ip: string): Promise<boolean> {
	const client = getClient()
	if (!client) {
		console.warn('RESEND_API_KEY not configured; skipping email')
		return false
	}

	try {
		await client.emails.send({
			from: 'Grantham Resume Website <daniel@dgrantham.com>',
			to: notificationEmail,
			subject: `New Hire Inquiry from ${company}`,
			text: [
				`New hire inquiry received:`,
				``,
				`Company: ${company}`,
				`Contact Email: ${email}`,
				`Submitted: ${new Date().toISOString()}`,
				`IP: ${ip}`
			].join('\n')
		})
		return true
	} catch {
		console.error('Failed to send hire notification email')
		return false
	}
}
