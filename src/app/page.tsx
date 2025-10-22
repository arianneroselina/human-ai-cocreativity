"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Workflow = "human" | "ai" | "human_ai" | "ai_human";

const workflows: {
  key: Workflow;
  label: string;
  title: string;
  desc: string;
  icon: string;
}[] = [
  { key: "human", label: "Human", title: "Human only", desc: "Write everything yourself. No AI involved.", icon: "✍️" },
  { key: "ai", label: "AI", title: "AI only", desc: "Generate a single AI draft, then submit (read-only).", icon: "🤖" },
  { key: "human_ai", label: "Human→AI", title: "You then AI", desc: "Write first, then AI edits once. Locks after AI.", icon: "🧠→🤖" },
  { key: "ai_human", label: "AI→Human", title: "AI then you", desc: "Start with AI draft once, then you can edit.", icon: "🤖→🧠" },
];

export default function StartPage() {
  const [choice, setChoice] = useState<Workflow>("human");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const selected = workflows.find(w => w.key === choice)!;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-4xl p-6">
        {/* Hero */}
        <section className="rounded-xl border bg-white/70 backdrop-blur p-6 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Choose your workflow
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            You’ll confirm your choice before starting. Estimated duration: ~10 minutes.
          </p>

          {/* Selectable cards */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {workflows.map((w) => {
              const active = w.key === choice;
              return (
                <button
                  key={w.key}
                  type="button"
                  onClick={() => setChoice(w.key)}
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

          {/* Tiny rules + Start */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ul className="text-xs text-slate-500 list-disc pl-4">
              <li>No personal data is collected.</li>
              <li>You can’t change workflow after starting.</li>
              <li>Please submit before time runs out.</li>
            </ul>
            <div className="ml-auto">
              <Button onClick={() => setOpen(true)}>
                Start with {selected.label}
              </Button>
            </div>
          </div>
        </section>

        {/* Help / info row */}
        <section className="mt-4 text-xs text-slate-500">
          Need to switch later? Use the “Change workflow” button on the work page to come back here.
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
            <Button onClick={() => {
              setOpen(false);
              // navigate to specific work page
              // /work/human, /work/ai, /work/human_ai, /work/ai_human
              // NOTE: route folder names must exist
              router.push(`/work/${choice}`);
            }}>
              Start now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
