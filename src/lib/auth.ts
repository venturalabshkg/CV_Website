import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { readSession, SESSION_COOKIE, signSession } from "@/lib/session";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await readSession(token);
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/admin/login");
  return user;
}

export async function setSession(userId: string, email: string) {
  const token = await signSession(userId, email);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function clientKey(email: string) {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerStore.get("x-real-ip") || "local";
  return `${ip}:${email.toLowerCase()}`;
}

export async function assertLoginAllowed(key: string) {
  const row = await prisma.loginAttempt.findUnique({ where: { key } });
  if (row && row.resetAt > new Date() && row.count >= MAX_ATTEMPTS) {
    return "Too many sign-in attempts. Wait a few minutes and try again.";
  }
  return null;
}

export async function recordLoginFailure(key: string) {
  const now = new Date();
  const resetAt = new Date(Date.now() + WINDOW_MS);
  const row = await prisma.loginAttempt.findUnique({ where: { key } });
  if (!row || row.resetAt <= now) {
    await prisma.loginAttempt.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return;
  }
  await prisma.loginAttempt.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
}

export async function clearLoginFailures(key: string) {
  await prisma.loginAttempt.deleteMany({ where: { key } });
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
