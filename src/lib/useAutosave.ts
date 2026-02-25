"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DraftSnapshot = { text: string; aiLocked?: boolean };
type DraftSetters = { setText: (v: string) => void; setAiLocked?: (v: boolean) => void };

export function useAutosave(
  storageKey: string | null | undefined,
  snapshot: DraftSnapshot,
  setters: DraftSetters,
  delay = 500
) {
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const timer = useRef<number | null>(null);
  const rawStoredRef = useRef<string | null>(null); // exact raw from localStorage
  const restoredRef = useRef(false);

  const payload = useMemo(
    () => JSON.stringify({ v: 1, text: snapshot.text ?? "", aiLocked: !!snapshot.aiLocked }),
    [snapshot.text, snapshot.aiLocked]
  );

  // Restore once when key is ready
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      rawStoredRef.current = raw;
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          if (typeof parsed.text === "string") setters.setText(parsed.text);
          if (typeof parsed.aiLocked === "boolean" && setters.setAiLocked)
            setters.setAiLocked(parsed.aiLocked);
        }
      }
    } catch {
      // ignore parse errors; we'll overwrite with our JSON format on next save
    }
    restoredRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Debounced save — but *first* short-circuit if already up to date
  useEffect(() => {
    if (!storageKey || !restoredRef.current) return;

    const isUpToDate = rawStoredRef.current === payload;

    if (isUpToDate) {
      // cancel any pending timer
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
      if (saving) setSaving(false);
      return;
    }

    // needs save
    if (timer.current) window.clearTimeout(timer.current);
    setSaving(true);

    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, payload);
        rawStoredRef.current = payload;
        setLastSavedAt(Date.now());
      } catch {}
      setSaving(false);
      timer.current = null;
    }, delay);

    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [storageKey, payload, delay, saving]);

  return { saving, lastSavedAt };
}
