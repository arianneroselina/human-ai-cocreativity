"use client";

import { Pause, Play, AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePauseResumeHotkeys } from "@/components/ui/shortcut";

interface RoundHeaderProps {
  workflow: string;
  seconds?: number;
  active?: boolean;
  onTimeUp?: () => void;
}

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RoundHeader({workflow, seconds = 300, active = true, onTimeUp,}: RoundHeaderProps) {
  const [paused, setPaused] = useState(false);
  const [remaining, setRemaining] = useState(seconds);

  const resumeBtnRef = useRef<HTMLButtonElement>(null);

  const endAtRef = useRef<number | null>(null);
  const didWarn1MinRef = useRef(false);
  const didForceSubmitRef = useRef(false);

  // keep latest callback without re-triggering effects
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // measure header bottom so this dock sits below it
  const [topOffset, setTopOffset] = useState(12);

  useEffect(() => {
    const measure = () => {
      const header = document.querySelector<HTMLElement>("header[data-app-header]");
      if (!header) {
        setTopOffset(12);
        return;
      }
      const bottom = header.getBoundingClientRect().bottom;
      setTopOffset(Math.round(bottom + 12));
    };

    measure();

    const header = document.querySelector<HTMLElement>("header[data-app-header]");
    const ro = header ? new ResizeObserver(measure) : null;
    if (header && ro) ro.observe(header);

    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, []);

  // init/reset when seconds changes (new task)
  useEffect(() => {
    setPaused(false);
    setRemaining(seconds);
    didWarn1MinRef.current = false;
    didForceSubmitRef.current = false;
    endAtRef.current = Date.now() + seconds * 1000;
  }, [seconds]);

  const togglePause = useCallback(() => setPaused((p) => !p), []);
  usePauseResumeHotkeys(paused, setPaused);

  // Pause overlay behavior (scroll lock + focus)
  useEffect(() => {
    if (!paused) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    resumeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [paused]);

  // When pausing/resuming, recompute endAt based on remaining
  useEffect(() => {
    if (!active) return;

    if (paused) {
      endAtRef.current = null;
      return;
    }

    endAtRef.current = Date.now() + remaining * 1000;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, active]);

  // Main ticker
  useEffect(() => {
    if (!active) return;
    if (paused) return;

    const tick = () => {
      const endAt = endAtRef.current;
      if (!endAt) return;

      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(left);

      // 1-minute warning
      if (left <= 60 && left > 10 && !didWarn1MinRef.current) {
        didWarn1MinRef.current = true;
      }

      // time up -> force submit once
      if (left === 0 && !didForceSubmitRef.current) {
        didForceSubmitRef.current = true;

        // small delay
        window.setTimeout(() => {
          onTimeUpRef.current?.();
        }, 700);
      }
    };

    const id = window.setInterval(tick, 250);
    tick();

    return () => window.clearInterval(id);
  }, [active, paused]);

  const showOneMinute = didWarn1MinRef.current && remaining <= 60 && remaining > 10;
  const showFinal = remaining <= 10 && remaining > 0;
  const showSubmitting = remaining === 0;

  const timeBadgeClasses = useMemo(() => {
    if (showFinal) return "border-red-300 bg-red-50 text-red-700 animate-pulse";
    if (remaining <= 60) return "border-yellow-300 bg-yellow-50 text-yellow-800";
    return "border-border bg-background text-foreground";
  }, [showFinal, remaining]);

  const noticeClasses = useMemo(() => {
    if (showFinal || showSubmitting) return "border-red-300 bg-red-50 text-red-700 animate-pulse";
    return "border-yellow-300 bg-yellow-50 text-yellow-800";
  }, [showFinal, showSubmitting]);

  // Desktop: right dock. Mobile: bottom dock to avoid covering content.
  const dockStyle = useMemo(() => {
    return {
      top: `${topOffset}px`,
    } as React.CSSProperties;
  }, [topOffset]);

  return (
    <>
      {/* Fixed dock */}
      <div
        className="
          fixed z-40 pointer-events-none
          right-4
          max-sm:left-4 max-sm:right-4 max-sm:top-auto max-sm:bottom-4
        "
        style={dockStyle}
      >
        <div
          className="
            pointer-events-auto
            w-[280px] max-sm:w-auto
            rounded-2xl border border-border bg-card text-card-foreground shadow-md
            p-4
          "
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Workflow</div>
              <div className="text-sm font-medium text-foreground truncate">{workflow}</div>
            </div>

            <button
              type="button"
              onClick={togglePause}
              aria-pressed={paused}
              aria-label={paused ? "Resume" : "Pause"}
              title={paused ? "Resume" : "Pause"}
              className={`inline-flex shrink-0 items-center justify-center rounded-full border border-border p-2
                          hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring
                          ${paused ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700" : ""}`}
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div
              className={`tabular-nums rounded-full border px-3 py-1 text-sm font-semibold ${timeBadgeClasses}`}
              aria-label="Time remaining"
            >
              {formatMMSS(remaining)}
            </div>
            <div className="text-xs text-muted-foreground">
              {paused ? "Paused" : active ? "Time remaining" : "Stopped"}
            </div>
          </div>

          {/* Warning box (always visible because dock is fixed) */}
          {!paused && (showOneMinute || showFinal || showSubmitting) && (
            <div
              className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${noticeClasses}`}
              aria-live="polite"
              role="status"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {showOneMinute && <span>1 minute left — please finish and submit.</span>}
              {showFinal && <span>Auto-submitting in {remaining}s…</span>}
              {showSubmitting && <span>Time is up — submitting now…</span>}
            </div>
          )}
        </div>
      </div>

      {/* Blocking overlay when paused */}
      {paused && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="paused-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="mx-4 max-w-md rounded-2xl bg-card text-card-foreground p-6 shadow-xl border border-border">
            <h2 id="paused-title" className="text-lg font-semibold">
              Paused
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Timer is stopped. Resume to continue.</p>

            <div className="mt-5 flex items-center justify-center">
              <button
                ref={resumeBtnRef}
                onClick={() => setPaused(false)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Play className="h-3.5 w-3.5" /> Resume
              </button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground text-center">
              Tip: Press{" "}
              <kbd className="rounded border border-border bg-muted px-1">Space</kbd> or{" "}
              <kbd className="rounded border border-border bg-muted px-1">Esc</kbd> to resume.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
