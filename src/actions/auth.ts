"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  assertLoginAllowed,
  clearLoginFailures,
  clearSession,
  clientKey,
  recordLoginFailure,
  requireAdmin,
  setSession,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { actionError, type ActionResult } from "@/lib/action";

export async function loginAction(input: { email: string; password: string }): Promise<ActionResult> {
  try {
    const data = loginSchema.parse(input);
    const key = await clientKey(data.email);
    const limited = await assertLoginAllowed(key);
    if (limited) return { ok: false, error: limited };

    const user = await prisma.adminUser.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    const valid = user ? await verifyPassword(data.password, user.passwordHash) : false;
    if (!user || !valid) {
      await recordLoginFailure(key);
      return { ok: false, error: "Email or password is incorrect." };
    }

    await clearLoginFailures(key);
    await setSession(user.id, user.email);
  } catch (error) {
    return actionError(error, "Could not sign in.");
  }

  redirect("/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/admin/login");
}

export async function assertAdminAction() {
  await requireAdmin();
}
