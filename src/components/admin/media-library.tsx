"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Item = { id: string; filename: string; url: string; mimeType: string; size: number; createdAt: string };

export function MediaLibrary({ items }: { items: Item[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [pending, setPending] = useState(false);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesQuery = item.filename.toLowerCase().includes(query.trim().toLowerCase()) || item.url.toLowerCase().includes(query.trim().toLowerCase());
        const matchesType = type === "all" || item.mimeType === type;
        return matchesQuery && matchesType;
      }),
    [items, query, type],
  );

  async function upload(file: File) {
    const body = new FormData();
    body.set("file", file);
    setPending(true);
    const response = await fetch("/api/media", { method: "POST", body });
    const data = await response.json();
    setPending(false);
    if (!response.ok) toast.error(data.error || "Upload failed.");
    else {
      toast.success("Uploaded.");
      router.refresh();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this image?")) return;
    const response = await fetch("/api/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await response.json();
    if (!response.ok) toast.error(data.error || "Could not delete.");
    else {
      toast.success("Deleted.");
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search images" className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none sm:max-w-xs" />
        <select value={type} onChange={(event) => setType(event.target.value)} className="border border-line bg-transparent px-3 py-2 text-sm">
          <option value="all">All types</option>
          <option value="image/jpeg">JPG</option>
          <option value="image/png">PNG</option>
          <option value="image/webp">WebP</option>
          <option value="image/svg+xml">SVG</option>
        </select>
        <label className="cursor-pointer border border-line px-3 py-2 text-sm">
          {pending ? "Uploading…" : "Upload image"}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} />
        </label>
      </div>
      {filtered.length === 0 && <p className="text-sm text-muted">No images match.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.id} className="border border-line p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.filename} className="h-36 w-full object-contain bg-chip" />
            <p className="mt-3 truncate text-sm">{item.filename}</p>
            <p className="font-mono text-[11px] text-muted">{item.mimeType} · {Math.ceil(item.size / 1024)} KB</p>
            <div className="mt-3 flex gap-2 text-xs">
              <button type="button" onClick={async () => { await navigator.clipboard.writeText(item.url); toast.success("URL copied."); }}>Copy URL</button>
              <button type="button" className="text-danger" onClick={() => void remove(item.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
