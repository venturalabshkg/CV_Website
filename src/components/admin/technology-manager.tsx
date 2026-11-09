"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteTechnology,
  deleteTechnologyCategory,
  moveTechnology,
  moveTechnologyCategory,
  saveTechnology,
  saveTechnologyCategory,
} from "@/actions/content";
import { Field, controlClass } from "@/components/admin/nav";
import { ImageField } from "@/components/admin/image-field";

type Tech = { id: string; name: string; icon: string; url: string; visible: boolean; categoryId: string };
type Category = { id: string; name: string; visible: boolean; technologies: Tech[] };

export function TechnologyManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [editing, setEditing] = useState<Tech | null>(null);
  const [icon, setIcon] = useState("");
  const selected = categories.find((category) => category.id === categoryId) ?? categories[0];

  function run(action: () => Promise<{ ok: boolean; error?: string }>, message: string) {
    start(async () => {
      const result = await action();
      if (!result.ok) toast.error(result.error || "Could not update.");
      else {
        toast.success(message);
        setEditing(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <section>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Categories</h2>
        <ul className="mt-3 border-t border-line">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-2 border-b border-line py-2">
              <button type="button" className={`flex-1 text-left text-sm ${category.id === selected?.id ? "text-fg" : "text-muted"}`} onClick={() => setCategoryId(category.id)}>
                {category.name}{category.visible ? "" : " · hidden"}
              </button>
              <button type="button" className="font-mono text-[10px]" onClick={() => run(() => saveTechnologyCategory({ id: category.id, name: category.name, visible: !category.visible }), "Category updated.")}>{category.visible ? "Hide" : "Show"}</button>
              <button type="button" className="font-mono text-[10px]" onClick={() => run(() => moveTechnologyCategory(category.id, "up"), "Reordered.")}>Up</button>
              <button type="button" className="font-mono text-[10px]" onClick={() => run(() => moveTechnologyCategory(category.id, "down"), "Reordered.")}>Down</button>
              <button
                type="button"
                className="font-mono text-[10px] text-danger"
                onClick={() => {
                  if (confirm(`Delete ${category.name}?`)) run(() => deleteTechnologyCategory(category.id), "Category deleted.");
                }}
              >
                Del
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            run(() => saveTechnologyCategory({ name: form.get("name"), visible: true }), "Category saved.");
            event.currentTarget.reset();
          }}
        >
          <Field label="New category"><input name="name" className={controlClass} required /></Field>
          <button disabled={pending} className="border border-line px-3 py-1.5 text-sm">Add category</button>
        </form>
      </section>
      <section>
        <h2 className="text-lg tracking-tight">{selected?.name || "Add a category first"}</h2>
        <ul className="mt-4 border-t border-line">
          {selected?.technologies.map((tech) => (
            <li key={tech.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3">
              <span className="grid size-8 place-items-center border border-line font-mono text-[10px]">{tech.icon.slice(0, 2) || tech.name.slice(0, 2)}</span>
              <span className="flex-1 text-sm">{tech.name}{tech.visible ? "" : " · hidden"}</span>
              <button type="button" className="text-xs" onClick={() => { setEditing(tech); setIcon(tech.icon); }}>Edit</button>
              <button type="button" className="text-xs" onClick={() => run(() => moveTechnology(tech.id, "up"), "Reordered.")}>Up</button>
              <button type="button" className="text-xs" onClick={() => run(() => moveTechnology(tech.id, "down"), "Reordered.")}>Down</button>
              <button type="button" className="text-xs text-danger" onClick={() => { if (confirm(`Delete ${tech.name}?`)) run(() => deleteTechnology(tech.id), "Technology deleted."); }}>Delete</button>
            </li>
          ))}
        </ul>
        {selected && (
          <form
            className="mt-6 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              run(
                () =>
                  saveTechnology({
                    id: editing?.id,
                    name: form.get("name"),
                    icon: icon || form.get("icon"),
                    url: form.get("url"),
                    categoryId: selected.id,
                    visible: form.get("visible") === "on",
                  }),
                "Technology saved.",
              );
            }}
          >
            <Field label={editing ? "Edit technology" : "New technology"}>
              <input name="name" key={editing?.id || "new"} defaultValue={editing?.name || ""} className={controlClass} required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Short label"><input name="icon" value={icon} onChange={(event) => setIcon(event.target.value)} className={controlClass} /></Field>
              <Field label="Link"><input name="url" key={`${editing?.id}-url`} defaultValue={editing?.url || ""} className={controlClass} /></Field>
            </div>
            <ImageField label="Icon image" value={icon.startsWith("/") || icon.startsWith("http") ? icon : ""} onChange={setIcon} />
            <label className="flex items-center gap-2 text-sm">
              <input name="visible" type="checkbox" defaultChecked={editing ? editing.visible : true} key={`${editing?.id}-visible`} />
              Visible on the site
            </label>
            <div className="flex gap-2">
              <button disabled={pending} className="on-fg px-3 py-2 text-sm">{pending ? "Saving…" : editing ? "Update" : "Add technology"}</button>
              {editing && <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => { setEditing(null); setIcon(""); }}>Cancel</button>}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
