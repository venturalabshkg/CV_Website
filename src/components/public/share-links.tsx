"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { siteUrl } from "@/lib/utils";

export function ShareLinks({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${siteUrl()}${path}`;
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted">
      <span>Share</span>
      <a className="hover:text-fg" href={`https://twitter.com/intent/tweet?url=${encoded}&text=${text}`} target="_blank" rel="noreferrer">X</a>
      <a className="hover:text-fg" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noreferrer">LinkedIn</a>
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-fg"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="size-3" /> : <Link2 className="size-3" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
