"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Search } from "lucide-react";

export type PaletteItem = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  href?: string;
  external?: boolean;
  action?: "theme-dark" | "theme-light";
};

export function CommandPalette({
  items,
  open,
  onClose,
}: {
  items: PaletteItem[];
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const { setTheme } = useTheme();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle
      ? items.filter((item) => `${item.label} ${item.group} ${item.hint ?? ""}`.toLowerCase().includes(needle))
      : items;
    return list.slice(0, 14);
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
  }, [open]);

  if (!open) return null;

  function run(item: PaletteItem) {
    onClose();
    if (item.action === "theme-dark") return setTheme("dark");
    if (item.action === "theme-light") return setTheme("light");
    if (!item.href) return;
    if (item.external) window.open(item.href, "_blank", "noopener,noreferrer");
    else router.push(item.href);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-[12vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-xl border border-line bg-elevated"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-3">
          <Search className="size-4 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((value) => Math.min(value + 1, Math.max(filtered.length - 1, 0)));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((value) => Math.max(value - 1, 0));
              }
              if (event.key === "Enter" && filtered[active]) run(filtered[active]);
              if (event.key === "Escape") onClose();
            }}
            placeholder="Search pages, projects, and articles"
            className="h-12 w-full bg-transparent text-sm outline-none"
          />
          <kbd className="font-mono text-[10px] text-muted">esc</kbd>
        </div>
        <ul className="max-h-80 overflow-auto py-2">
          {filtered.length === 0 && <li className="px-4 py-6 text-sm text-muted">Nothing matches that search.</li>}
          {filtered.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => run(item)}
                className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm ${index === active ? "bg-chip" : ""}`}
              >
                <span>
                  <span className="block">{item.label}</span>
                  {item.hint && <span className="block text-xs text-muted">{item.hint}</span>}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{item.group}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
