"use server";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const RESET_TTL_MS = 1000 * 60 * 30; // 30 minutes

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export interface LoginResult {
  ok: boolean;
  error?: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const cleanEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "Invalid email or password." };
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: session.expiresAt,
    path: "/",
  });

  return { ok: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export interface RequestResetResult {
  ok: boolean;
}

/** Always returns ok — never reveals whether an email is registered. */
export async function requestPasswordReset(email: string): Promise<RequestResetResult> {
  const cleanEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  if (user) {
    const token = await prisma.passwordResetToken.create({
      data: { userId: user.id, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
    });

    const origin = await siteOrigin();
    const resetUrl = `${origin}/login/reset?token=${token.id}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && !apiKey.startsWith("re_placeholder")) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "Zaira Mundo <onboarding@resend.dev>",
        to: cleanEmail,
        subject: "Reset your admin password",
        html: `<p>Someone requested a password reset for this account.</p>
<p><a href="${resetUrl}">Click here to set a new password</a> (link expires in 30 minutes).</p>
<p>If you didn't request this, you can ignore this email.</p>`,
      }).catch((err) => console.error("[auth] Reset email error:", err));
    } else {
      console.log(`[auth] Password reset link for ${cleanEmail}: ${resetUrl}`);
    }
  }

  return { ok: true };
}

export interface ResetPasswordResult {
  ok: boolean;
  error?: string;
}

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult> {
  if (newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { id: token } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashPassword(newPassword) },
    }),
    prisma.passwordResetToken.update({
      where: { id: token },
      data: { usedAt: new Date() },
    }),
    // Invalidate all existing sessions for this user on password change
    prisma.session.deleteMany({ where: { userId: resetToken.userId } }),
  ]);

  return { ok: true };
}
