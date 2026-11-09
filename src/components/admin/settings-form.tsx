"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSettings } from "@/actions/content";
import { Field, controlClass } from "@/components/admin/nav";
import { ImageField } from "@/components/admin/image-field";

type Settings = {
  siteName: string;
  siteTitle: string;
  logoText: string;
  faviconUrl: string;
  description: string;
  defaultTheme: "dark" | "light";
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  contactEmail: string;
  accentColor: string;
  footerNote: string;
  showOverview: boolean;
  showGithub: boolean;
  showAbout: boolean;
  showStack: boolean;
  showExperience: boolean;
  showProjects: boolean;
  showBlog: boolean;
  showEducation: boolean;
};

const toggles: [keyof Settings, string][] = [
  ["showOverview", "Overview"],
  ["showGithub", "GitHub activity"],
  ["showAbout", "About"],
  ["showStack", "Technologies"],
  ["showExperience", "Experience"],
  ["showProjects", "Projects"],
  ["showBlog", "Blog"],
  ["showEducation", "Education"],
];

export function SettingsForm({ settings }: { settings: Settings }) {
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState(settings);

  return (
    <form
      className="grid max-w-3xl gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const result = await saveSettings(draft);
          if (!result.ok) toast.error(result.error);
          else toast.success("Settings saved.");
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Website name"><input className={controlClass} value={draft.siteName} onChange={(event) => setDraft({ ...draft, siteName: event.target.value })} /></Field>
        <Field label="Logo text"><input className={controlClass} maxLength={6} value={draft.logoText} onChange={(event) => setDraft({ ...draft, logoText: event.target.value })} /></Field>
      </div>
      <Field label="Website title"><input className={controlClass} value={draft.siteTitle} onChange={(event) => setDraft({ ...draft, siteTitle: event.target.value })} /></Field>
      <Field label="Description"><textarea className={controlClass} rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field>
      <Field label="Default theme">
        <select className={controlClass} value={draft.defaultTheme} onChange={(event) => setDraft({ ...draft, defaultTheme: event.target.value as "dark" | "light" })}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </Field>
      <Field label="SEO title"><input className={controlClass} value={draft.seoTitle} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} /></Field>
      <Field label="Meta description"><textarea className={controlClass} rows={3} value={draft.seoDescription} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} /></Field>
      <Field label="Contact email"><input type="email" className={controlClass} value={draft.contactEmail} onChange={(event) => setDraft({ ...draft, contactEmail: event.target.value })} /></Field>
      <Field label="Footer note"><input className={controlClass} value={draft.footerNote} onChange={(event) => setDraft({ ...draft, footerNote: event.target.value })} /></Field>
      <Field label="Accent color">
        <input type="color" value={draft.accentColor} onChange={(event) => setDraft({ ...draft, accentColor: event.target.value })} />
      </Field>
      <ImageField label="Favicon" value={draft.faviconUrl} onChange={(faviconUrl) => setDraft({ ...draft, faviconUrl })} />
      <ImageField label="Open Graph image" value={draft.ogImageUrl} onChange={(ogImageUrl) => setDraft({ ...draft, ogImageUrl })} />
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Public sections</legend>
        {toggles.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(draft[key])}
              onChange={(event) => setDraft({ ...draft, [key]: event.target.checked } as Settings)}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <button disabled={pending} className="on-fg w-fit px-4 py-2 text-sm">{pending ? "Saving…" : "Save settings"}</button>
    </form>
  );
}
