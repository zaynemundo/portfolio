"use server";

import { Resend } from "resend";

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactResult {
  ok: boolean;
  error?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendNotificationEmail(name: string, email: string, message: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_placeholder")) return;

  const resend = new Resend(apiKey);
  const receivedAt = new Date().toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai",
  });

  await resend.emails.send({
    from: "Zaira Mundo <onboarding@resend.dev>",
    to: "mzaira.mundo@gmail.com",
    replyTo: email,
    subject: `New inquiry from ${name}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New inquiry</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

        <!-- Header -->
        <tr><td style="background:#080612;border-radius:14px 14px 0 0;padding:28px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="width:36px;height:36px;background:#785EF7;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;margin-right:12px">
                  <span style="color:#fff;font-size:11px;font-weight:800;letter-spacing:-0.03em;line-height:1">ZM</span>
                </div>
                <span style="color:#fff;font-size:14px;font-weight:700;letter-spacing:-0.01em;vertical-align:middle">Zaira Mundo</span>
              </td>
              <td align="right">
                <span style="font-size:11px;color:rgba(255,255,255,0.3);vertical-align:middle">${receivedAt} GST</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Accent bar -->
        <tr><td style="background:#785EF7;height:3px"></td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px 32px 28px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7">

          <!-- Badge + title -->
          <div style="margin-bottom:24px">
            <span style="display:inline-block;background:#ede9fe;color:#6248e0;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:3px 10px;border-radius:999px;margin-bottom:12px">New inquiry</span>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#09090b;letter-spacing:-0.03em;line-height:1.2">Someone wants to work with you</h1>
          </div>

          <!-- Sender card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #e4e4e7;border-radius:10px;margin-bottom:20px">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #f0f0f0">
                <span style="font-size:10px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:4px">From</span>
                <span style="font-size:15px;font-weight:700;color:#09090b">${name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px">
                <span style="font-size:10px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:4px">Email</span>
                <a href="mailto:${email}" style="font-size:14px;color:#785EF7;text-decoration:none;font-weight:500">${email}</a>
              </td>
            </tr>
          </table>

          <!-- Message -->
          <div style="margin-bottom:28px">
            <span style="font-size:10px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:8px">Message</span>
            <div style="background:#fafafa;border:1px solid #e4e4e7;border-left:3px solid #785EF7;border-radius:0 8px 8px 0;padding:16px 18px">
              <p style="margin:0;font-size:14px;color:#3f3f46;line-height:1.75;white-space:pre-wrap">${message}</p>
            </div>
          </div>

          <!-- CTA button -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr>
              <td style="border-radius:8px;background:#785EF7">
                <a href="mailto:${email}?subject=Re: Your inquiry&body=Hi ${name},%0A%0A" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:-0.01em">Reply to ${name} →</a>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fafafa;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 14px 14px;padding:20px 32px;text-align:center">
          <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6">
            This notification was sent to mzaira.mundo@gmail.com because someone submitted the contact form on <a href="https://zairamundo.com" style="color:#785EF7;text-decoration:none">zairamundo.com</a>.<br>
            Reply directly to this email to respond to ${name}.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function submitContact(payload: ContactPayload): Promise<ContactResult> {
  const { name, email, message } = payload;

  if (!name || name.trim().length < 2) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!email || !isValidEmail(email.trim())) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!message || message.trim().length < 10) {
    return { ok: false, error: "Please write a message (at least 10 characters)." };
  }
  if (message.trim().length > 2000) {
    return { ok: false, error: "Message is too long (max 2000 characters)." };
  }

  const cleanName    = name.trim();
  const cleanEmail   = email.trim().toLowerCase();
  const cleanMessage = message.trim();

  try {
    await sendNotificationEmail(cleanName, cleanEmail, cleanMessage);
  } catch (err) {
    console.error("[contact] Email error:", err);
    return {
      ok: false,
      error: "Unable to send your message right now. Please email me directly at mzaira.mundo@gmail.com",
    };
  }

  return { ok: true };
}
