"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteEducation, moveEducation, saveEducation } from "@/actions/content";
import { Field, controlClass } from "@/components/admin/nav";
import { ImageField } from "@/components/admin/image-field";

type Item = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  logoUrl: string;
  visible: boolean;
};

const empty: Item = { id: "", institution: "", degree: "", field: "", startDate: "", endDate: "", description: "", logoUrl: "", visible: true };

export function EducationManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<Item>(empty);

  return (
    <div className="grid gap-10 xl:grid-cols-[1fr_1fr]">
      <ul className="border-t border-line">
        {items.length === 0 && <li className="py-3 text-sm text-muted">No education records yet.</li>}
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-line py-3">
            <div>
              <p className="font-medium">{item.institution}</p>
              <p className="text-sm text-muted">{item.degree} · {item.field}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => setDraft(item)}>Edit</button>
              <button type="button" onClick={() => start(async () => { await moveEducation(item.id, "up"); router.refresh(); })}>Up</button>
              <button type="button" onClick={() => start(async () => { await moveEducation(item.id, "down"); router.refresh(); })}>Down</button>
              <button type="button" className="text-danger" onClick={() => { if (!confirm("Delete this record?")) return; start(async () => { const result = await deleteEducation(item.id); if (!result.ok) toast.error(result.error); else { toast.success("Deleted."); router.refresh(); } }); }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="grid gap-4 border border-line p-4"
        onSubmit={(event) => {
          event.preventDefault();
          start(async () => {
            const result = await saveEducation({ ...draft, id: draft.id || undefined });
            if (!result.ok) toast.error(result.error);
            else {
              toast.success("Education saved.");
              setDraft(empty);
              router.refresh();
            }
          });
        }}
      >
        <h2 className="text-lg tracking-tight">{draft.id ? "Edit record" : "New record"}</h2>
        <Field label="Institution"><input className={controlClass} value={draft.institution} onChange={(event) => setDraft({ ...draft, institution: event.target.value })} required /></Field>
        <Field label="Degree"><input className={controlClass} value={draft.degree} onChange={(event) => setDraft({ ...draft, degree: event.target.value })} required /></Field>
        <Field label="Field of study"><input className={controlClass} value={draft.field} onChange={(event) => setDraft({ ...draft, field: event.target.value })} required /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start"><input type="date" className={controlClass} value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} /></Field>
          <Field label="End"><input type="date" className={controlClass} value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} /></Field>
        </div>
        <Field label="Description"><textarea className={controlClass} rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field>
        <ImageField label="Institution logo" value={draft.logoUrl} onChange={(logoUrl) => setDraft({ ...draft, logoUrl })} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.visible} onChange={(event) => setDraft({ ...draft, visible: event.target.checked })} /> Visible</label>
        <div className="flex gap-2">
          <button disabled={pending} className="on-fg px-3 py-2 text-sm">{pending ? "Saving…" : "Save"}</button>
          <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => setDraft(empty)}>Clear</button>
        </div>
      </form>
    </div>
  );
}
