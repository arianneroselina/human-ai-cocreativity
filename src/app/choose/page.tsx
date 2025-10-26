"use client";

import { useState } from "react";
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
  const router = useRouter();
  const selected = Workflows.find(w => w.key === choice)!;

  const pick = (wf: Workflow) => {
    setChoice(wf)
    send({ type: 'SELECT_WORKFLOW', workflow: wf, taskId: `task-${run.trialIndex}` });
  }
  const startTrial = () => {
    setOpen(false);
    router.push(`/task/${choice}`);
    send({ type: 'LOCK_WORKFLOW' });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Progress />
      <div className="mx-auto max-w-4xl p-6 space-y-4">
        {/* Top title */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Human–AI Co-Creativity</h1>
          <p className="mt-1 text-sm text-slate-600">Experimental study interface</p>
        </div>

        {/* Hero */}
        <section className="rounded-xl border bg-white/70 backdrop-blur p-6 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Choose your workflow
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            You’ll confirm your choice before starting. Estimated duration: ~10 minutes.
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
                    "text-left rounded-lg border bg-white p-4 shadow-sm transition",
                    active ? "border-sky-400 ring-2 ring-sky-200" : "hover:border-slate-300"
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{w.icon}</div>
                    <div>
                      <div className="font-medium">{w.title}</div>
                      <div className="text-sm text-slate-600">{w.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Rules/>
            <div className="ml-auto">
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

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="text-xl">{selected.icon}</div>
              <div>
                <div className="font-medium">{selected.title}</div>
                <div className="text-sm text-slate-600">{selected.desc}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              After you start, this choice will be locked for this session.
            </div>
          </div>

          <DialogFooter className="mt-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={startTrial}>Start now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
