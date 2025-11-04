"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export default function AutoSaveIndicator({saving, lastSavedAt}: {
  saving: boolean;
  lastSavedAt: number | null;
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      {saving ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Saving…</span>
        </>
      ) : lastSavedAt ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Saved {timeAgo(lastSavedAt)}</span>
        </>
      ) : (
        <span>Autosave on</span>
      )}
    </div>
  );
}
