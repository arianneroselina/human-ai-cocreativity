"use client";

import { TimerBadge } from "@/components/shadcn_ui/timer";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { usePauseResumeHotkeys } from "@/components/ui/shortcut";

interface RoundHeaderProps {
  workflow: string;
  round: number;
}

export default function RoundHeader({ workflow, round }: RoundHeaderProps) {
  const [paused, setPaused] = useState(false);
  const resumeBtnRef = useRef<HTMLButtonElement>(null);

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  usePauseResumeHotkeys(paused, setPaused);

  useEffect(() => {
    if (paused) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      resumeBtnRef.current?.focus();
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [paused]);

  return (
    <>
      {round > 0 && (
        <div className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-4xl p-4 flex items-center gap-3">
            <div className="mr-auto">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Human-AI Co-Creativity</h1>
              <p className="text-xs text-muted-foreground">
                Round {round}: <span className="font-medium text-foreground">{workflow}</span>
              </p>
            </div>

            <TimerBadge
              seconds={600}
              onDone={() => setPaused(true)}
              running={!paused}
              className="bg-background text-foreground"
            />

            <button
              type="button"
              onClick={togglePause}
              aria-pressed={paused}
              aria-label={paused ? "Resume" : "Pause"}
              title={paused ? "Resume" : "Pause"}
              className={`inline-flex items-center justify-center rounded-full border border-border p-2
                          hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring
                          ${paused ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700" : ""}`}
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

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
            <p className="mt-2 text-sm text-muted-foreground">You can’t edit until you resume.</p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                ref={resumeBtnRef}
                onClick={() => setPaused(false)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-2 py-1 text-sm font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Play className="h-3 w-3" /> Resume
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
