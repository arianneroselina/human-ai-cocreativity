"use client";

import { useEffect } from "react";

export function useSubmitHotkey(onSubmit: () => void, deps: any[] = []) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function usePauseResumeHotkeys(
  paused: boolean,
  setPaused: (value: boolean) => void
) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!paused) return;

      if (e.key === " " || e.key === "Escape") {
        e.preventDefault();
        setPaused(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, setPaused]);
}
