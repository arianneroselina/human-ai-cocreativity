"use client";

import { useMemo, useState } from "react";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { Button } from "@/components/shadcn_ui/button";
import { Play, Timer, Shuffle, ArrowRight, Loader2 } from "lucide-react";
import { Workflows } from "@/lib/experiment";
import Progress from "@/components/ui/layout/progress";

export default function PracticeStartPage() {
  useRouteGuard(["practice"]);

  const { run, send } = useExperiment();
  const [loading, setLoading] = useState(false);

  const currentPracticeIndex = run.roundIndex; // 1-based
  const isFirstPracticeRound = currentPracticeIndex === 1;

  const highlights = useMemo(
    () => [
      { icon: <Shuffle className="h-4 w-4" />, text: "4 tasks (random order)" },
      { icon: <Timer className="h-4 w-4" />, text: "5 minutes each" },
      { icon: <ArrowRight className="h-4 w-4" />, text: "Feedback after each round" },
    ],
    []
  );

  const start = async () => {
    if (loading) return;
    setLoading(true);

    send({ type: "START_PRACTICE_ROUND" });

    const { run, setRoundStarted } = useExperiment.getState();

    const res = await fetch("/api/round/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: run.sessionId,
        roundIndex: run.roundIndex,
        workflow: run.workflow,
        taskId: run.taskId,
      }),
    });

    const data = await res.json();
    setRoundStarted(data.startedAt);

    console.log("Practice Round started:", {
      sessionId: run.sessionId,
      roundIndex: run.roundIndex,
      workflow: run.workflow,
      startedAt: data.startedAt,
    });

    setLoading(false);
  };

  return (
    <>
      <Progress />

      <div className="mx-auto max-w-4xl p-6">
        <section className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              {`Practice round ${currentPracticeIndex}`}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {isFirstPracticeRound
                ? "You'll complete a few short practice tasks to get familiar with the different workflows."
                : "You're continuing the practice phase."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {highlights.map((it, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <span className="text-muted-foreground">{it.icon}</span>
                  <span className="font-medium text-foreground">{it.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm font-medium text-amber-900">
                💡 <strong>Do your best!</strong> Practice results will be used in the study too.
              </p>
            </div>

            {isFirstPracticeRound && (
              <div className="mt-6">
                <div className="text-sm font-medium text-foreground">Workflows you’ll see</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Workflows.map((w) => (
                    <div
                      key={w.key}
                      className="rounded-lg border border-border bg-card p-3 text-sm"
                    >
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <span className="text-base">{w.icon}</span>
                        <span>{w.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button onClick={start} disabled={loading} className="inline-flex items-center gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isFirstPracticeRound ? "Start practice" : "Continue to next round"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
