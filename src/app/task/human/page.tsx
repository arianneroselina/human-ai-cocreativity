"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails from "@/components/ui/taskDetails";
import Header from "@/components/ui/header";
import ConfirmDialog from "@/components/ui/confirm";
import { countWords, checkWords } from "@/lib/check";
import { submitData } from "@/lib/submit";
import { usePreventBack } from "@/lib/usePreventBack";
import { useWorkflowGuard } from "@/lib/useWorkflowGuard";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import Rules from "@/components/ui/rules";
import Progress from "@/components/ui/progress";

export default function HumanPage() {
  useRouteGuard(["task"]);
  useWorkflowGuard();
  usePreventBack(true);

  const { run, send } = useExperiment();
  const router = useRouter();

  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const readOnly = useMemo(() => locked, [locked]);
  const words = countWords(text);
  const { meetsRequiredWords, meetsAvoidWords } = checkWords(text);

  const clearDraft = () => setText("");

  const submit = () => {
    setLocked(true);
    submitData(words, meetsRequiredWords, meetsAvoidWords, text, router);
    send({ type: "SUBMIT_TRIAL" });
  };

  const submitDisabled = locked || text.trim().length === 0;

  return (
    <main className="min-h-dvh bg-background">
      <Header workflow="Human only" trial={run.trialIndex} />
      <Progress />

      <div className="mx-auto max-w-4xl p-6">
        {/* Info */}
        <TaskDetails />

        {/* Actions */}
        <section className="mt-4">
          <div className="items-center rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">
              Write entirely by yourself. <span className="font-medium text-foreground">No AI available.</span> Submit
              before time runs out.
            </p>
          </div>
        </section>

        {/* Editor Section */}
        <section className="mt-4">
          <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="draft" className="text-sm font-medium">
                Your draft
              </Label>
              <span className="text-xs text-muted-foreground">
                {words} words • {text.length} chars
              </span>
            </div>

            <Textarea
              id="draft"
              rows={14}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write here…"
              readOnly={readOnly}
              className={`${readOnly ? "bg-muted" : "bg-background"} text-foreground placeholder:text-muted-foreground`}
            />

            <div className="mt-3 flex items-center justify-between gap-2">
              <Rules />

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={clearDraft}
                  disabled={locked || text.length === 0}
                >
                  Clear
                </Button>

                <Button onClick={() => setSubmitOpen(true)} disabled={submitDisabled}>
                  Submit
                </Button>

                <ConfirmDialog
                  open={submitOpen}
                  onOpenChange={setSubmitOpen}
                  title="Submit your draft?"
                  description="You won't be able to edit after submitting."
                  confirmLabel="Submit"
                  cancelLabel="Cancel"
                  onConfirm={submit}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
