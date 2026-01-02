"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { Button } from "@/components/shadcn_ui/button";
import { Play, Timer, Shuffle, ArrowRight, Loader2 } from "lucide-react";
import {Workflows} from "@/lib/experiment";
import Progress from "@/components/ui/progress";

export default function PracticeStartPage() {
  useRouteGuard(["practice"]);

  const router = useRouter();
  const { send } = useExperiment();
  const [loading, setLoading] = useState(false);

  const highlights = useMemo(
    () => [
      { icon: <Shuffle className="h-4 w-4" />, text: "4 tasks (random order)" },
      { icon: <Timer className="h-4 w-4" />, text: "5 minutes each" },
      { icon: <ArrowRight className="h-4 w-4" />, text: "1-min pause between (skippable)" },
    ],
    []
  );

  const start = () => {
    if (loading) return;
    setLoading(true);

    send({ type: "START_PRACTICE" } as any);

    const next = (useExperiment.getState().run as any).workflow;
    router.replace(`/task/${next ?? "human"}`);
  };

  return (
    <main className="min-h-dvh bg-background">
      <Progress />

      <div className="mx-auto max-w-4xl p-6">
        <section className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Practice rounds</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Please do each task as best as you can.
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

            <div className="mt-6">
              <div className="text-sm font-medium text-foreground">Workflows you’ll see</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Workflows.map((w) => (
                  <div key={w.key} className="rounded-lg border border-border bg-card p-3 text-sm">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <span className="text-base">{w.icon}</span>
                      <span>{w.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={start} disabled={loading} className="inline-flex items-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Start
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
