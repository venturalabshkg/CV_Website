"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";

const links = [
  ["Dashboard", "/admin"],
  ["Profile", "/admin/profile"],
  ["Technologies", "/admin/technologies"],
  ["Experience", "/admin/experience"],
  ["Projects", "/admin/projects"],
  ["Blog", "/admin/blog"],
  ["Education", "/admin/education"],
  ["Social links", "/admin/social"],
  ["Media library", "/admin/media"],
  ["Settings", "/admin/settings"],
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-bg md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Admin</p>
          <p className="mt-1 max-w-[12rem] truncate text-xs text-muted">{email}</p>
        </div>
        <Link href="/" className="text-xs underline underline-offset-4">View site</Link>
      </div>
      <nav className="flex gap-1 overflow-auto px-3 pb-3 md:flex-1 md:flex-col">
        {links.map(([label, href]) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`whitespace-nowrap px-3 py-2 text-sm ${active ? "bg-chip text-fg" : "text-muted hover:text-fg"}`}>
              {label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="hidden border-t border-line p-3 md:block">
        <button type="submit" className="w-full border border-line px-3 py-2 text-left text-sm hover:bg-chip">Log out</button>
      </form>
      <form action={logoutAction} className="px-3 pb-3 md:hidden">
        <button type="submit" className="text-sm text-muted">Log out</button>
      </form>
    </aside>
  );
}

export function AdminHeader({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl tracking-tight">{title}</h1>
        {text && <p className="mt-1 max-w-2xl text-sm text-muted">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export const controlClass = "w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-fg";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{label}</span>
      {children}
    </label>
  );
}
