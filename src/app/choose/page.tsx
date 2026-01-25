"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Progress from '@/components/ui/progress';
import { Button } from "@/components/shadcn_ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/shadcn_ui/dialog";
import { useExperiment } from '@/stores/useExperiment';
import { Workflow, Workflows } from '@/lib/experiment';
import { useRouteGuard } from "@/lib/useRouteGuard";
import Rules from "@/components/ui/rules";

export default function Choose() {
  useRouteGuard(['choose_workflow']);

  const { run, send } = useExperiment();
  const [choice, setChoice] = useState<Workflow>("human");
  const [open, setOpen] = useState(false);
  const selected = Workflows.find(w => w.key === choice)!;

  const pick = (wf: Workflow) => {
    setChoice(wf);
    send({ type: 'SELECT_WORKFLOW', workflow: wf });
  };

  const startRound = async () => {
    setOpen(false);
    send({ type: 'LOCK_WORKFLOW' });

    const { run } = useExperiment.getState();
    await fetch('/api/round/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: run.sessionId,
        roundIndex: run.roundIndex,
        workflow: run.workflow,
        taskId: run.taskId,
      }),
    });

    console.log("Round started:", {
      sessionId: run.sessionId,
      roundIndex: run.roundIndex,
      workflow: run.workflow,
    });
  };

  // Re-announce the current choice when a new round starts
  useEffect(() => {
    send({ type: 'SELECT_WORKFLOW', workflow: choice });
  }, [run.roundIndex, send]); // intentionally not depending on `choice` to avoid double sends

  return (
    <main className="min-h-dvh bg-background">
      <Progress />

      <div className="mx-auto max-w-4xl p-6 space-y-4">
        {/* Hero */}
        <section className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Choose your workflow
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You&#39;ll confirm your choice before starting. Estimated duration: ~5 minutes.
          </p>

          {/* Selectable cards */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Workflows.map((w) => {
              const active = w.key === choice;
              return (
                <button
                  key={w.key}
                  onClick={() => pick(w.key)}
                  className={[
                    "text-left rounded-lg border border-border bg-card p-4 shadow-sm transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary ring-2 ring-primary/30"
                      : "hover:bg-accent"
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{w.icon}</div>
                    <div>
                      <div className="font-medium text-foreground">{w.title}</div>
                      <div className="text-sm text-muted-foreground">{w.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Rules />
            <div className="ml-auto">
              {/* Default Button uses bg-primary/text-primary-foreground from your tokens */}
              <Button onClick={() => setOpen(true)}>
                Start with {selected.label}
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Confirm dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm workflow</DialogTitle>
          </DialogHeader>

          <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
            <div className="flex items-start gap-3">
              <div className="text-xl">{selected.icon}</div>
              <div>
                <div className="font-medium text-foreground">{selected.title}</div>
                <div className="text-sm text-muted-foreground">{selected.desc}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              After you start, this choice will be locked for this session.
            </div>
          </div>

          <DialogFooter className="mt-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={startRound}>Start now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
