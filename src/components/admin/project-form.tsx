"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveProject } from "@/actions/projects";
import { Field, controlClass } from "@/components/admin/nav";
import { ImageField } from "@/components/admin/image-field";

type Tech = { id: string; name: string; category: string };
type Project = {
  id?: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  technologyIds: string[];
};

export function ProjectForm({ project, technologies }: { project: Project; technologies: Tech[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState(project);

  return (
    <form
      className="grid max-w-3xl gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const result = await saveProject({ ...draft, id: draft.id || undefined });
          if (!result.ok) toast.error(result.error);
          else {
            toast.success("Project saved.");
            if (!draft.id && result.data) router.push(`/admin/projects/${result.data.id}`);
            else router.refresh();
          }
        });
      }}
    >
      <Field label="Title">
        <input className={controlClass} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required />
      </Field>
      <Field label="Description">
        <textarea className={controlClass} rows={6} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required />
      </Field>
      <ImageField label="Portfolio image" value={draft.thumbnailUrl} onChange={(thumbnailUrl) => setDraft({ ...draft, thumbnailUrl })} />
      <fieldset>
        <legend className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Skills</legend>
        {technologies.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Add skills in Technologies, then select them here.</p>
        ) : (
          <div className="mt-2 grid max-h-56 gap-1 overflow-auto sm:grid-cols-2">
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
                <span>{tech.name}</span>
                <span className="text-xs text-muted">{tech.category}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <button disabled={pending} className="on-fg w-fit px-4 py-2 text-sm">
        {pending ? "Saving…" : "Save project"}
      </button>
    </form>
  );
}
