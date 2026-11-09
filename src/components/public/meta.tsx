"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

export function LocalTime({ timeZone }: { timeZone: string }) {
  const [text, setText] = useState("");

  useEffect(() => {
    const format = () => {
      try {
        setText(new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone }).format(new Date()));
      } catch {
        setText(new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date()));
      }
    };
    format();
    const id = window.setInterval(format, 30000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return <span>{text || "--:--"}</span>;
}

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-fg"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
