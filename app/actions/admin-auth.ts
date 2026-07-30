"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData): Promise<never> {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminPassword || !adminSecret || password !== adminPassword) {
    redirect("/admin/login?error=1");
  }

  const jar = await cookies();
  jar.set("admin_session", adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/admin");
}

export async function logout(): Promise<never> {
  const jar = await cookies();
  jar.delete("admin_session");
  redirect("/admin/login");
}
