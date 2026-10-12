"use server";

import { Resend } from "resend";
import { prisma } from "@/app/lib/prisma";
import { emailButton, emailShell, escapeHtml } from "@/app/lib/email-template";
import { emailFrom } from "@/app/lib/email";

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

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const replyHref = `mailto:${safeEmail}?subject=${encodeURIComponent("Re: Your inquiry")}&amp;body=${encodeURIComponent(`Hi ${name},\n\n`)}`;

  await resend.emails.send({
    from: emailFrom(),
    to: "mzaira.mundo@gmail.com",
    replyTo: email,
    subject: `New inquiry from ${name}`,
    html: emailShell({
      preheader: `${safeName} sent a message through your contact form.`,
      badge: "New inquiry",
      title: "Someone wants to work with you",
      headerNote: `${receivedAt} GST`,
      body: `<!-- Sender card -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafafa;border:1px solid #e4e4e7;border-radius:10px;margin-bottom:20px">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #f0f0f0">
                <span style="font-size:10px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:4px">From</span>
                <span style="font-size:15px;font-weight:700;color:#09090b">${safeName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px">
                <span style="font-size:10px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:4px">Email</span>
                <a href="mailto:${safeEmail}" style="font-size:14px;color:#785EF7;text-decoration:none;font-weight:500">${safeEmail}</a>
              </td>
            </tr>
          </table>

          <!-- Message -->
          <div style="margin-bottom:28px">
            <span style="font-size:10px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:8px">Message</span>
            <div style="background:#fafafa;border:1px solid #e4e4e7;border-left:3px solid #785EF7;border-radius:0 8px 8px 0;padding:16px 18px">
              <p style="margin:0;font-size:14px;color:#3f3f46;line-height:1.75;white-space:pre-wrap">${escapeHtml(message)}</p>
            </div>
          </div>

          ${emailButton(replyHref, `Reply to ${safeName} →`)}`,
      footer: `This notification was sent to mzaira.mundo@gmail.com because someone submitted the contact form on <a href="https://zairamundo.com" style="color:#785EF7;text-decoration:none">zairamundo.com</a>.<br>
            Reply directly to this email to respond to ${safeName}.`,
    }),
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
    await prisma.inquiry.create({ data: { name: cleanName, email: cleanEmail, message: cleanMessage } });
  } catch (err) {
    console.error("[contact] DB error:", err);
    return {
      ok: false,
      error: "Unable to send your message right now. Please email me directly at mzaira.mundo@gmail.com",
    };
  }

  try {
    await sendNotificationEmail(cleanName, cleanEmail, cleanMessage);
  } catch (err) {
    // Non-fatal — the inquiry is already saved and visible in the dashboard.
    console.error("[contact] Email error:", err);
  }

  return { ok: true };
}
