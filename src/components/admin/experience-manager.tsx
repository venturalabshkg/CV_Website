"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteExperience, moveExperience, saveExperience } from "@/actions/content";
import { Field, controlClass } from "@/components/admin/nav";
import { ImageField } from "@/components/admin/image-field";

type Tech = { id: string; name: string };
type Item = {
  id: string;
  company: string;
  title: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  responsibilities: string;
  logoUrl: string;
  visible: boolean;
  technologyIds: string[];
};

const empty: Item = {
  id: "",
  company: "",
  title: "",
  employmentType: "Contract",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  responsibilities: "",
  logoUrl: "",
  visible: true,
  technologyIds: [],
};

export function ExperienceManager({ items, technologies }: { items: Item[]; technologies: Tech[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<Item>(empty);

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    start(async () => {
      const result = await saveExperience({ ...draft, id: draft.id || undefined });
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Experience saved.");
        setDraft(empty);
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-10 xl:grid-cols-[1fr_1fr]">
      <div>
        {items.length === 0 && <p className="text-sm text-muted">No roles yet. Add only positions you want to publish.</p>}
        <ul className="border-t border-line">
          {items.map((item) => (
            <li key={item.id} className="border-b border-line py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.company}</p>
                  <p className="text-sm text-muted">{item.title} · {item.employmentType}{item.visible ? "" : " · hidden"}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button type="button" onClick={() => setDraft(item)}>Edit</button>
                  <button type="button" onClick={() => start(async () => { await moveExperience(item.id, "up"); router.refresh(); })}>Up</button>
                  <button type="button" onClick={() => start(async () => { await moveExperience(item.id, "down"); router.refresh(); })}>Down</button>
                  <button type="button" className="text-danger" onClick={() => { if (!confirm("Delete this role?")) return; start(async () => { const result = await deleteExperience(item.id); if (!result.ok) toast.error(result.error); else { toast.success("Deleted."); router.refresh(); } }); }}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={save} className="grid gap-4 border border-line p-4">
        <h2 className="text-lg tracking-tight">{draft.id ? "Edit role" : "New role"}</h2>
        <Field label="Company"><input className={controlClass} value={draft.company} onChange={(event) => setDraft({ ...draft, company: event.target.value })} required /></Field>
        <Field label="Title"><input className={controlClass} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Employment type"><input className={controlClass} value={draft.employmentType} onChange={(event) => setDraft({ ...draft, employmentType: event.target.value })} required /></Field>
          <Field label="Location"><input className={controlClass} value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} /></Field>
          <Field label="Start date"><input type="date" className={controlClass} value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} required /></Field>
          <Field label="End date"><input type="date" className={controlClass} value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} disabled={draft.current} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.current} onChange={(event) => setDraft({ ...draft, current: event.target.checked, endDate: event.target.checked ? "" : draft.endDate })} /> Current role</label>
        <Field label="Description"><textarea className={controlClass} rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field>
        <Field label="Responsibilities, one per line"><textarea className={controlClass} rows={5} value={draft.responsibilities} onChange={(event) => setDraft({ ...draft, responsibilities: event.target.value })} /></Field>
        <ImageField label="Company logo" value={draft.logoUrl} onChange={(logoUrl) => setDraft({ ...draft, logoUrl })} />
        <fieldset>
          <legend className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Technologies</legend>
          <div className="mt-2 grid max-h-48 gap-1 overflow-auto sm:grid-cols-2">
            {technologies.map((tech) => (
              <label key={tech.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.technologyIds.includes(tech.id)}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      technologyIds: event.target.checked
                        ? [...draft.technologyIds, tech.id]
                        : draft.technologyIds.filter((id) => id !== tech.id),
                    })
                  }
                />
                {tech.name}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.visible} onChange={(event) => setDraft({ ...draft, visible: event.target.checked })} /> Visible</label>
        <div className="flex gap-2">
          <button disabled={pending} className="on-fg px-3 py-2 text-sm">{pending ? "Saving…" : "Save role"}</button>
          <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => setDraft(empty)}>Clear</button>
        </div>
      </form>
    </div>
  );
}
