import { Hono } from "hono";
import { insertInquiry, countRecentInquiries, markEmailSent } from "../db.ts";
import { sendHireNotification } from "../email.ts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hire = new Hono();

hire.post("/", async (c) => {
  try {
    const body = await c.req.json<{ company?: string; email?: string }>();
    const company = body.company?.trim() ?? "";
    const email = body.email?.trim() ?? "";

    if (!company || company.length > 200) {
      return c.json({ error: "Company name is required" }, 400);
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return c.json({ error: "Invalid email format" }, 400);
    }

    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      c.req.header("x-real-ip") ??
      c.req.header("host") ??
      c.req.header("origin") ??
      "unknown";

    const isLocal = ip === "127.0.0.1" || ip === "::1" || ip.startsWith("localhost:");
    if (!isLocal) {
      const recentCount = countRecentInquiries(ip);
      if (recentCount >= 10) {
        return c.json({ error: "Rate limit exceeded" }, 429);
      }
    }

    const id = insertInquiry(company, email, ip);

    const emailSent = await sendHireNotification(company, email, ip);
    if (emailSent) {
      markEmailSent(id);
    }

    return c.json({ success: true }, 200);
  } catch {
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default hire;
