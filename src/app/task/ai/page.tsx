"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails, { GeneralAIRules, Task } from "@/components/ui/taskDetails";
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
import { Loader2 } from "lucide-react";

export default function AIPage() {
  useRouteGuard(['task']);
  useWorkflowGuard();
  usePreventBack(true);

  const { run, send } = useExperiment();
  const router = useRouter();

  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const readOnly = useMemo(() => true, []);
  const words = countWords(text);
  const { meetsRequiredWords, meetsAvoidWords } = checkWords(text);

  const generateAiDraft = async () => {
    if (aiUsed || loading) return;
    setLoading(true);

    const input = [
      Task[0],
      `- ${Task[1]}`,
      `- ${Task[2]}`,
      `- ${Task[3]}`,
      `- ${Task[4]}`,
      ``,
      GeneralAIRules.join("\n"),
    ].join("\n");

    console.log("Generate AI Prompt:", input);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("AI error", err);
        return;
      }

      const data = await res.json();
      setText(data.text || "");
      setAiUsed(true);
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    setLocked(true);
    submitData(words, meetsRequiredWords, meetsAvoidWords, text, router);
    send({ type: 'SUBMIT_TRIAL' });
  };

  const submitDisabled = locked || !aiUsed || text.trim().length === 0;

  return (
    <main className="min-h-dvh bg-background">
      <Header workflow="AI only" round={run.roundIndex} />
      <Progress />

      <div className="mx-auto max-w-4xl p-6">
        {/* Info */}
        <TaskDetails />

        {/* Actions */}
        <section className="mt-4">
          <div className="items-center rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">
              Generate a single AI draft and <span className="font-medium text-foreground">submit without editing</span>.
            </p>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={generateAiDraft} disabled={locked || aiUsed || loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : aiUsed ? (
                  "AI Draft Generated"
                ) : (
                  "Generate AI Draft"
                )}
              </Button>
              <span className="ml-auto text-sm text-muted-foreground">
                {loading
                  ? "Generating draft..."
                  : aiUsed
                    ? "Review the AI draft and submit."
                    : "Generate the AI draft to proceed."}
              </span>
            </div>
          </div>
        </section>

        {/* Editor (read-only) */}
        <section className="mt-4">
          <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="draft" className="text-sm font-medium">AI draft (read-only)</Label>
              <span className="text-xs text-muted-foreground">
                {words} words • {text.length} chars
              </span>
            </div>
            <Textarea
              id="draft"
              rows={14}
              value={text}
              readOnly={readOnly}
              placeholder="Click 'Generate AI Draft' to see the output..."
              className="bg-muted text-foreground placeholder:text-muted-foreground"
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <Rules />

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
        </section>
      </div>
    </main>
  );
}
