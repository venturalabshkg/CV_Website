"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X } from "lucide-react";
import { CommandPalette, type PaletteItem } from "@/components/public/command-palette";

const sections = [
  { href: "/#overview", id: "overview", label: "Overview" },
  { href: "/#projects", id: "projects", label: "Projects" },
  { href: "/#experience", id: "experience", label: "Experience" },
  { href: "/blog", id: "blog", label: "Blog" },
];

export function SiteHeader({ logo, items }: { logo: string; items: PaletteItem[] }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [menu, setMenu] = useState(false);
  const [palette, setPalette] = useState(false);
  const [active, setActive] = useState("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const nodes = ["overview", "about", "stack", "experience", "projects", "blog", "education"]
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.15, 0.4] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);

  const home = pathname === "/";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-5">
          <Link href="/" className="grid size-8 shrink-0 place-items-center border border-line font-mono text-[11px] tracking-wide" aria-label="Home">
            {logo}
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {sections.map((section) => {
              const current =
                section.id === "blog"
                  ? pathname.startsWith("/blog")
                  : section.id === "projects"
                    ? pathname.startsWith("/projects") || (home && active === "projects")
                    : home && (active === section.id || (section.id === "overview" && ["about", "stack", "overview"].includes(active)));
              return (
                <Link key={section.id} href={section.href} className={current ? "text-fg" : "text-muted transition-colors hover:text-fg"}>
                  {section.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="inline-flex items-center gap-2 border border-line px-2 py-1 font-mono text-[11px] text-muted hover:text-fg"
              aria-label="Open command palette"
            >
              <span className="hidden sm:inline">Search</span>
              <kbd className="border border-line px-1">Ctrl K</kbd>
            </button>
            <button
              type="button"
              aria-label="Toggle color theme"
              onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
              className="grid size-8 place-items-center border border-line"
            >
              {mounted && resolvedTheme === "light" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button type="button" className="grid size-8 place-items-center border border-line md:hidden" aria-label="Open menu" onClick={() => setMenu(true)}>
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </header>
      {menu && (
        <div className="fixed inset-0 z-50 bg-bg md:hidden">
          <div className="flex h-14 items-center justify-between border-b border-line px-4">
            <span className="font-mono text-xs">{logo}</span>
            <button type="button" aria-label="Close menu" onClick={() => setMenu(false)} className="grid size-8 place-items-center border border-line">
              <X className="size-4" />
            </button>
          </div>
          <nav className="flex flex-col px-4 py-4 text-lg">
            {sections.map((section) => (
              <Link key={section.id} href={section.href} onClick={() => setMenu(false)} className="border-b border-line py-4">
                {section.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
      <CommandPalette items={items} open={palette} onClose={() => setPalette(false)} />
    </>
  );
}
