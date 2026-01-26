"use client";

import { Pause, Play, AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePauseResumeHotkeys } from "@/components/ui/shortcut";
import { usePause } from "@/components/ui/pauseContext";

interface TimerBadgeProps {
  workflow: string;
  seconds?: number;
  startedAt?: string;
  demo?: boolean;
  onTimeUp?: () => void;
}

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TimerBadge({
                                     workflow,
                                     seconds = 300,
                                     startedAt,
                                     demo,
                                     onTimeUp,
                                   }: TimerBadgeProps) {
  const { paused, setPaused } = usePause();

  const [remaining, setRemaining] = useState(seconds);
  const [didWarn1Min, setDidWarn1Min] = useState(false);
  const [didForceSubmit, setDidForceSubmit] = useState(false);

  const resumeBtnRef = useRef<HTMLButtonElement>(null);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const endAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (demo) {
      endAtRef.current = Date.now() + seconds * 1000;
      return;
    }

    if (!startedAt) {
      endAtRef.current = null;
      return;
    }

    endAtRef.current =
      new Date(startedAt).getTime() + seconds * 1000;
  }, [startedAt, seconds, demo]);


  // Reset warning flags if task changes
  useEffect(() => {
    setDidWarn1Min(false);
    setDidForceSubmit(false);
  }, [startedAt, seconds]);

  // Pause overlay
  useEffect(() => {
    if (!paused) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    resumeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [paused]);

  const togglePause = useCallback(() => {
    setPaused(!paused);
  }, [paused, setPaused]);

  usePauseResumeHotkeys(paused, setPaused);

  // Main ticker
  useEffect(() => {
    const tick = () => {
      if (paused) return;
      if (!endAtRef.current) return;
      if (demo) return;

      const left = Math.max(
        0,
        Math.ceil((endAtRef.current - Date.now()) / 1000)
      );

      setRemaining(left);

      if (left <= 60 && left > 10 && !didWarn1Min) {
        setDidWarn1Min(true);
      }

      // time up -> force submit once
      if (left === 0 && !didForceSubmit) {
        setDidForceSubmit(true);
        window.setTimeout(() => {
          onTimeUpRef.current?.();
        }, 700);
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [paused, didWarn1Min, didForceSubmit]);

  const showOneMinute = didWarn1Min && remaining <= 60 && remaining > 10;
  const showFinal = remaining <= 10 && remaining > 0;
  const showSubmitting = remaining === 0;

  const warningText =
    showOneMinute
      ? "1 minute left."
      : showFinal
        ? `Auto-submit in ${remaining}s.`
        : showSubmitting
          ? "Submitting now..."
          : null;

  const timeBadgeClasses = useMemo(() => {
    if (showFinal) return "border-red-300 bg-red-50 text-red-700 animate-pulse";
    if (remaining <= 60)
      return "border-yellow-300 bg-yellow-50 text-yellow-800";
    return "border-border bg-background text-foreground";
  }, [showFinal, remaining]);

  return (
    <>
      <div className="w-[120px] mb-4 rounded-xl px-4 py-2 border border-border bg-card text-card-foreground shadow-lg flex flex-col hover:shadow-xl transition-shadow">
        <div className="text-xs text-muted-foreground">Workflow</div>
        <div className="text-sm font-semibold">{workflow}</div>

        <div className="flex justify-between items-center">
          <span
            className={`tabular-nums rounded-lg p-2 text-sm font-semibold ${timeBadgeClasses}`}
          >
            {formatMMSS(remaining)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePause();
            }}
            className={`inline-flex items-center justify-center rounded-full border border-border p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring
              ${
              paused
                ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                : ""
            }`}
            aria-label={paused ? "Resume" : "Pause"}
            title={paused ? "Resume" : "Pause"}
          >
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Warning chip */}
      {!paused && warningText && (
        <div className="flex justify-start mt-4">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm shadow-lg
              ${
              showFinal || showSubmitting
                ? "border-red-300 bg-red-50 text-red-700 animate-pulse"
                : "border-yellow-300 bg-yellow-50 text-yellow-800"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>{warningText}</span>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {paused && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="paused-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="mx-4 max-w-md rounded-xl bg-card text-card-foreground p-6 shadow-xl border border-border">
            <h2 id="paused-title" className="text-xl font-semibold">
              Paused
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Timer is stopped. Resume to continue.
            </p>

            <div className="mt-6 flex items-center justify-center">
              <button
                ref={resumeBtnRef}
                onClick={() => setPaused(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-4 py-3 text-sm font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Play className="h-4 w-4" /> Resume
              </button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground text-center">
              Tip: Press{" "}
              <kbd className="rounded border border-border bg-muted px-2 py-1">
                Space
              </kbd>{" "}
              or{" "}
              <kbd className="rounded border border-border bg-muted px-2 py-1">
                Esc
              </kbd>{" "}
              to resume.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
