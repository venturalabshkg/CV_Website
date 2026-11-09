import { ZodError } from "zod";
import { zodError } from "@/lib/validators";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export function actionError(error: unknown, fallback = "Something went wrong. Try again."): ActionResult {
  if (error instanceof ZodError) return { ok: false, error: zodError(error) };
  if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "P2002") {
    return { ok: false, error: "A record with that name or slug already exists." };
  }
  console.error(error);
  return { ok: false, error: fallback };
}
