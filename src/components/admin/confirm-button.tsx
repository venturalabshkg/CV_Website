"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action";

export function ConfirmButton({
  action,
  label,
  message,
}: {
  action: () => Promise<ActionResult>;
  label: string;
  message: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="text-xs text-danger disabled:opacity-50"
      onClick={() => {
        if (!confirm(message)) return;
        start(async () => {
          const result = await action();
          if (!result.ok) toast.error(result.error);
          else {
            toast.success("Deleted.");
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
