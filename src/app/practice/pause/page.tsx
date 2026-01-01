"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { Button } from "@/components/shadcn_ui/button";
import { Loader2, SkipForward } from "lucide-react";
import { Workflows, type Workflow } from "@/lib/experiment";

const TOTAL = 60;

function workflowTitle(wf?: Workflow | null) {
  if (!wf) return "Next task";
  const meta = Workflows.find((w) => w.key === wf);
  return meta?.title ?? wf;
}

export default function PracticePausePage() {
  useRouteGuard(["practice_pause"]);

  const router = useRouter();
  const { run, send } = useExperiment();

  const [secondsLeft, setSecondsLeft] = useState(TOTAL);
  const [loading, setLoading] = useState(false);

  const nextWorkflow = useMemo(() => {
    const r: any = run as any;
    return (r.workflow ?? "human") as Workflow;
  }, [run]);

  const startedAtRef = useRef<number | null>(null);

  const goNext = () => {
    if (loading) return;
    setLoading(true);

    send({ type: "NEXT_ROUND" } as any);

    const wf = ((useExperiment.getState().run as any).workflow ?? nextWorkflow) as Workflow;
    router.replace(`/task/${wf}`);
  };

  useEffect(() => {
    startedAtRef.current = Date.now();

    const tick = () => {
      const startedAt = startedAtRef.current ?? Date.now();
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, TOTAL - elapsed);
      setSecondsLeft(left);

      if (left <= 0) goNext();
    };

    const id = window.setInterval(tick, 250);
    tick();

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = 1 - secondsLeft / TOTAL; // 0..1
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * progress;

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl p-6">
        <section className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              {/* Ring timer */}
              <div className="relative grid place-items-center">
                <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                  />
                </svg>

                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-4xl font-semibold tabular-nums tracking-tight">
                    {secondsLeft}
                    <span className="ml-1 text-base text-muted-foreground">s</span>
                  </div>
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight">Short break</h2>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-sm">
                <span className="text-muted-foreground">Next:</span>
                {/*TODO: this flickers to next workflow*/}
                <span className="font-medium text-foreground">{workflowTitle(nextWorkflow)}</span>
              </div>

              {/* Single action */}
              <div className="mt-7">
                <Button onClick={goNext} disabled={loading} className="inline-flex items-center gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SkipForward className="h-4 w-4" />
                  )}
                  Skip break
                </Button>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Auto-continues when the timer ends.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
