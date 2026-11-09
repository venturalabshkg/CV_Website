"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { loginAction } from "@/actions/auth";

export function LoginForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  return (
    <form
      className="w-full max-w-sm border border-line bg-bg p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setError("");
        start(async () => {
          const result = await loginAction({
            email: String(form.get("email") || ""),
            password: String(form.get("password") || ""),
          });
          if (result && !result.ok) {
            setError(result.error);
            toast.error(result.error);
          }
        });
      }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Private</p>
      <h1 className="mt-2 text-2xl tracking-tight">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted">This area is not linked from the public site.</p>
      <label className="mt-6 block space-y-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Email</span>
        <input name="email" type="email" autoComplete="username" required className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-fg" />
      </label>
      <label className="mt-4 block space-y-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-fg" />
      </label>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <button type="submit" disabled={pending} className="on-fg mt-6 w-full px-3 py-2 text-sm disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
