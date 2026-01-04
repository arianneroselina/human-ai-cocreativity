"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { Button } from "@/components/shadcn_ui/button";
import { Loader2, SkipForward } from "lucide-react";
import { Workflows, type Workflow } from "@/lib/experiment";
import Progress from "@/components/ui/progress";

const TOTAL = 60;

function workflowTitle(wf?: Workflow | null) {
  if (!wf) return "Next task";
  const meta = Workflows.find((w) => w.key === wf);
  return meta?.title ?? wf;
}

function computeNextPracticeWorkflow(r: any): Workflow | null {
  const order = (r.practiceOrder ?? []) as Workflow[];
  const current = Math.max(0, Number(r.roundIndex ?? 1) - 1);
  const nextIdx0 = current;
  return (order[nextIdx0] ?? null) as Workflow | null;
}

export default function PracticePausePage() {
  useRouteGuard(["practice_pause"]);

  const router = useRouter();
  const { run, send } = useExperiment();

  const [secondsLeft, setSecondsLeft] = useState(TOTAL);
  const [loading, setLoading] = useState(false);
  const busyRef = useRef(false);

  // Freeze the label ONCE so it doesn't change when Skip is clicked
  const frozenNextWorkflowRef = useRef<Workflow | null>(null);
  if (frozenNextWorkflowRef.current === null) {
    frozenNextWorkflowRef.current = computeNextPracticeWorkflow(run as any);
  }
  const frozenNextWorkflow = frozenNextWorkflowRef.current;

  const startedAtRef = useRef<number | null>(null);

  const goNext = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);

    send({ type: "NEXT_ROUND" } as any);

    const { run } = useExperiment.getState();

    await fetch('/api/round/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: run.sessionId,
        roundIndex: run.roundIndex,
        workflow: run.workflow,
      }),
    });

    console.log("Practice Round started:", {
      sessionId: run.sessionId,
      roundIndex: run.roundIndex,
      workflow: run.workflow,
    });

    if (run.phase === "choose_workflow") {
      router.replace("/choose");
    } else {
      const wf = (run.workflow ?? "human") as Workflow;
      router.replace(`/task/${wf}`);
    }
    setLoading(false);
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
      <Progress />

      <div className="mx-auto max-w-3xl p-6">
        <section className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              {/* Ring timer */}
              <div className="relative grid place-items-center">
                <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
                  <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
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
                <span className="font-medium text-foreground">
                  {frozenNextWorkflow ? workflowTitle(frozenNextWorkflow) : "Choose workflow (main rounds)"}
                </span>
              </div>

              <div className="mt-7">
                <Button onClick={goNext} disabled={loading} className="inline-flex items-center gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SkipForward className="h-4 w-4" />}
                  Skip break
                </Button>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">Auto-continues when the timer ends.</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
