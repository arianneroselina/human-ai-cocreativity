"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails, { GeneralAIRules, HumanThenAIRules, Task } from "@/components/ui/taskDetails";
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

export default function HumanAIPage() {
  useRouteGuard(["task"]);
  useWorkflowGuard();
  usePreventBack(true);

  const { run, send } = useExperiment();
  const router = useRouter();

  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [aiEdited, setAiEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const readOnly = useMemo(() => locked || aiEdited, [locked, aiEdited]);
  const words = countWords(text);
  const { meetsRequiredWords, meetsAvoidWords } = checkWords(text);

  const askAIToEdit = async () => {
    if (aiEdited || loading) return;
    if (!text.trim()) {
      alert("Please write something first before asking AI to edit.");
      return;
    }
    setLoading(true);

    const input = [
      `Improve the poem under <TEXT> while preserving its core meaning and voice. This was the task:`,
      ``,
      Task[0],
      `- ${Task[1]}`,
      `- ${Task[2]}`,
      `- ${Task[3]}`,
      `- ${Task[4]}`,
      ``,
      GeneralAIRules.join("\n"),
      HumanThenAIRules.join("\n"),
      ``,
      `<TEXT>`,
      text.trim(),
      `</TEXT>`
    ].join("\n");

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
      setAiEdited(true);
    } finally {
      setLoading(false);
    }
  };

  const clearDraft = () => setText("");

  const submit = () => {
    setLocked(true);
    submitData(words, meetsRequiredWords, meetsAvoidWords, text, router);
    send({ type: "SUBMIT_TRIAL" });
  };

  const submitDisabled = locked || text.trim().length === 0 || !aiEdited;

  return (
    <main className="min-h-dvh bg-background">
      <Header workflow="Human → AI" trial={run.trialIndex} />
      <Progress />

      <div className="mx-auto max-w-4xl p-6">
        {/* Info */}
        <TaskDetails />

        {/* Actions */}
        <section className="mt-4">
          <div className="items-center rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">
              Write first. Then ask AI to edit <span className="font-medium text-foreground">once</span>. After AI
              edits, editing is locked.
            </p>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={askAIToEdit} disabled={locked || aiEdited || text.trim().length === 0 || loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Editing...
                  </>
                ) : aiEdited ? (
                  "AI Edit Applied (Locked)"
                ) : (
                  "Ask AI to Edit"
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={clearDraft}
                disabled={locked || text.length === 0 || aiEdited || loading}
              >
                Clear
              </Button>

              <span className="ml-auto text-sm text-muted-foreground">
                {loading
                  ? "Editing with AI..."
                  : aiEdited
                    ? "AI edited your text. Editing is locked."
                    : "Write your draft, then ask AI to edit."}
              </span>
            </div>
          </div>
        </section>

        {/* Editor */}
        <section className="mt-4">
          <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="draft" className="text-sm font-medium">
                {aiEdited ? "AI-edited draft (locked)" : "Your draft"}
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
              placeholder="Write here... then click 'Ask AI to Edit'."
              readOnly={readOnly}
              className={`${readOnly ? "bg-muted" : "bg-background"} text-foreground placeholder:text-muted-foreground`}
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
