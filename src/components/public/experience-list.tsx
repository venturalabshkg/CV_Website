"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { lines } from "@/lib/utils";

export type ExperienceItem = {
  id: string;
  company: string;
  title: string;
  employmentType: string;
  location?: string | null;
  startLabel: string;
  endLabel: string;
  current: boolean;
  description: string;
  responsibilities: string;
  logoUrl?: string | null;
  technologies: string[];
};

export function ExperienceList({ items }: { items: ExperienceItem[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  if (items.length === 0) {
    return <p className="text-sm text-muted">Roles added in the admin dashboard will appear on this timeline.</p>;
  }

  return (
    <ol className="border-t border-line">
      {items.map((item) => {
        const expanded = open === item.id;
        const duties = lines(item.responsibilities);
        return (
          <li key={item.id} className="border-b border-line">
            <button type="button" className="flex w-full items-start gap-4 px-1 py-4 text-left" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : item.id)}>
              <span className="mt-1 hidden w-36 shrink-0 font-mono text-[11px] text-muted sm:block">
                {item.startLabel}
                {item.current ? " — Now" : item.endLabel ? ` — ${item.endLabel}` : ""}
              </span>
              {item.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.logoUrl} alt="" className="mt-0.5 size-9 border border-line object-cover" />
              ) : (
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center border border-line font-mono text-[10px]">{item.company.slice(0, 2).toUpperCase()}</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.company}</span>
                <span className="mt-0.5 block text-sm text-muted">{item.title}</span>
                <span className="mt-1 block font-mono text-[11px] text-muted sm:hidden">
                  {item.startLabel}
                  {item.current ? " — Now" : item.endLabel ? ` — ${item.endLabel}` : ""}
                </span>
              </span>
              <ChevronDown className={`mt-1 size-4 shrink-0 text-muted transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
            {expanded && (
              <div className="space-y-4 px-1 pb-5 sm:pl-[12.75rem]">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  {item.employmentType}
                  {item.location ? ` · ${item.location}` : ""}
                </p>
                {item.description && <p className="max-w-2xl text-sm leading-7 text-muted">{item.description}</p>}
                {duties.length > 0 && (
                  <ul className="max-w-2xl list-disc space-y-1 pl-4 text-sm leading-6">
                    {duties.map((duty) => (
                      <li key={duty}>{duty}</li>
                    ))}
                  </ul>
                )}
                {item.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.technologies.map((tech) => (
                      <span key={tech} className="border border-line px-2 py-1 font-mono text-[11px] text-muted">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
