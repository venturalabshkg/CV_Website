"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteSocial, moveSocial, saveSocial } from "@/actions/content";
import { Field, controlClass } from "@/components/admin/nav";
import { socialIcons } from "@/components/public/icons";

type Item = { id: string; platform: string; label: string; url: string; icon: string; visible: boolean };
const empty: Item = { id: "", platform: "", label: "", url: "", icon: "link", visible: true };

export function SocialManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<Item>(empty);

  return (
    <div className="grid gap-10 xl:grid-cols-[1fr_1fr]">
      <ul className="border-t border-line">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
            <div>
              <p>{item.label}</p>
              <p className="text-xs text-muted">{item.url}{item.visible ? "" : " · hidden"}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => setDraft(item)}>Edit</button>
              <button type="button" onClick={() => start(async () => { await moveSocial(item.id, "up"); router.refresh(); })}>Up</button>
              <button type="button" onClick={() => start(async () => { await moveSocial(item.id, "down"); router.refresh(); })}>Down</button>
              <button type="button" className="text-danger" onClick={() => { if (!confirm("Delete this link?")) return; start(async () => { const result = await deleteSocial(item.id); if (!result.ok) toast.error(result.error); else { toast.success("Deleted."); router.refresh(); } }); }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="grid gap-4 border border-line p-4"
        onSubmit={(event) => {
          event.preventDefault();
          start(async () => {
            const result = await saveSocial({ ...draft, id: draft.id || undefined });
            if (!result.ok) toast.error(result.error);
            else {
              toast.success("Link saved.");
              setDraft(empty);
              router.refresh();
            }
          });
        }}
      >
        <Field label="Platform"><input className={controlClass} value={draft.platform} onChange={(event) => setDraft({ ...draft, platform: event.target.value })} required /></Field>
        <Field label="Label"><input className={controlClass} value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} required /></Field>
        <Field label="URL"><input className={controlClass} value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} required /></Field>
        <Field label="Icon">
          <select className={controlClass} value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })}>
            {Object.keys(socialIcons).map((icon) => <option key={icon} value={icon}>{icon}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.visible} onChange={(event) => setDraft({ ...draft, visible: event.target.checked })} /> Visible</label>
        <div className="flex gap-2">
          <button disabled={pending} className="on-fg px-3 py-2 text-sm">{pending ? "Saving…" : "Save link"}</button>
          <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => setDraft(empty)}>Clear</button>
        </div>
      </form>
    </div>
  );
}
