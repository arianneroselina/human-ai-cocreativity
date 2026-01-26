"use client";

import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { Button } from "@/components/shadcn_ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function PracticeCompletePage() {
  useRouteGuard(["practice_complete"]);

  const { send } = useExperiment();

  const continueToMain = () => {
    send({ type: "NEXT_ROUND" });
  };

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl p-6">
        <section className="rounded-2xl border border-border bg-card p-8 shadow-sm text-card-foreground">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Practice complete
            </h2>
          </div>

          <p className="mt-4 text-muted-foreground">
            You&#39;ve completed all practice rounds and experienced each collaboration workflow.
          </p>

          <div className="mt-6 rounded-lg border border-border bg-muted p-4 text-sm">
            <p className="font-medium text-foreground">
              The next rounds are the real experiment.
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-muted-foreground">
              <li>You will choose a workflow before each round.</li>
              <li>Each round lasts approximately 5 minutes.</li>
              <li>Please do the tasks as best as you can.</li>
            </ul>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={continueToMain}
              className="inline-flex items-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
