"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { savePost } from "@/actions/blog";
import { Field, controlClass } from "@/components/admin/nav";
import { ImageField } from "@/components/admin/image-field";
import { slugify } from "@/lib/utils";

type Category = { id: string; name: string };
type Post = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  published: boolean;
  featured: boolean;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  categoryId: string;
  tags: string;
};

export function BlogForm({ post, categories }: { post: Post; categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState(post);
  const [slugTouched, setSlugTouched] = useState(Boolean(post.id));
  const [preview, setPreview] = useState(false);
  const tags = useMemo(() => draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean), [draft.tags]);

  return (
    <form
      className="grid max-w-4xl gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const result = await savePost({ ...draft, tags, id: draft.id || undefined });
          if (!result.ok) toast.error(result.error);
          else {
            toast.success(draft.published ? "Article published." : "Draft saved.");
            if (!draft.id && result.data) router.push(`/admin/blog/${result.data.id}`);
            else router.refresh();
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input className={controlClass} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value, slug: slugTouched ? current.slug : slugify(event.target.value) }))} required />
        </Field>
        <Field label="Slug"><input className={controlClass} value={draft.slug} onChange={(event) => { setSlugTouched(true); setDraft({ ...draft, slug: event.target.value }); }} required /></Field>
      </div>
      <Field label="Excerpt"><textarea className={controlClass} rows={3} value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} required /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select className={controlClass} value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
            <option value="">Uncategorized</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="Tags, comma separated"><input className={controlClass} value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} /></Field>
        <Field label="Publication date"><input type="date" className={controlClass} value={draft.publishedAt} onChange={(event) => setDraft({ ...draft, publishedAt: event.target.value })} /></Field>
      </div>
      <ImageField label="Cover image" value={draft.coverUrl} onChange={(coverUrl) => setDraft({ ...draft, coverUrl })} />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Markdown</span>
        <button type="button" className="text-sm underline" onClick={() => setPreview((value) => !value)}>{preview ? "Edit" : "Preview"}</button>
      </div>
      {preview ? (
        <div className="prose-custom min-h-48 border border-line p-4"><ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.content || "_Nothing to preview._"}</ReactMarkdown></div>
      ) : (
        <textarea className={`${controlClass} min-h-72 font-mono`} value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} required />
      )}
      <Field label="SEO title"><input className={controlClass} value={draft.seoTitle} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} /></Field>
      <Field label="SEO description"><textarea className={controlClass} rows={2} value={draft.seoDescription} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> Featured</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} /> Published</label>
      <div className="flex flex-wrap gap-2">
        <button disabled={pending} className="on-fg px-4 py-2 text-sm">{pending ? "Saving…" : draft.published ? "Save and publish" : "Save draft"}</button>
        {draft.slug && <Link href={`/blog/${draft.slug}`} target="_blank" className="border border-line px-4 py-2 text-sm">Preview</Link>}
      </div>
    </form>
  );
}
