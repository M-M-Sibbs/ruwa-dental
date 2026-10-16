"use server";

import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

export async function login(_prev: { error?: string; email?: string }, fd: FormData): Promise<{ error?: string; email?: string }> {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const next = String(fd.get("next") || "/admin");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return { error: "Too many sign-in attempts. Wait 15 minutes and try again.", email };
  }
  const [user] = await db.select().from(users).where(eq(users.email, email));
  const ok = user && user.active && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return { error: "Email or password is incorrect.", email };

  const token = await signSession({ userId: user.id, role: user.role, name: user.name });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  await audit(user.id, "login", "user", user.id);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
