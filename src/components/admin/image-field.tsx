"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ImageField({
  label,
  value,
  onChange,
  accept = "image/png,image/jpeg,image/webp,image/svg+xml",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
}) {
  const [pending, setPending] = useState(false);

  async function onFile(file: File) {
    const body = new FormData();
    body.set("file", file);
    setPending(true);
    const response = await fetch("/api/media", { method: "POST", body });
    const data = await response.json();
    setPending(false);
    if (!response.ok) toast.error(data.error || "Upload failed.");
    else {
      toast.success("Image uploaded.");
      onChange(data.url);
    }
  }

  return (
    <div className="space-y-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{label}</span>
      {value && !value.endsWith(".pdf") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-24 max-w-full border border-line object-cover" />
      )}
      {value.endsWith(".pdf") && <a href={value} className="block text-sm underline">Current file</a>}
      <div className="flex flex-wrap gap-2">
        <label className="cursor-pointer border border-line px-3 py-1.5 text-sm hover:bg-chip">
          {pending ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onFile(file);
              event.target.value = "";
            }}
          />
        </label>
        {value && (
          <button type="button" className="border border-line px-3 py-1.5 text-sm" onClick={() => onChange("")}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
