"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails, { GeneralAIRules, HumanThenAIRules, Task } from "@/components/ui/taskDetails";
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
import RoundHeader from "@/components/ui/roundHeader";
import { useSubmitHotkey } from "@/components/ui/shortcut";
import { useAutosave } from "@/lib/useAutosave";
import AutoSaveIndicator from "@/components/ui/autosaveIndicator";

export default function HumanAIPage() {
  useRouteGuard(["task"]);
  useWorkflowGuard();
  usePreventBack(true);

  const { run, send } = useExperiment();
  const router = useRouter();

  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const saveKey = `draft:${run.sessionId}:${run.roundIndex}:${run.workflow || "n/a"}`;
  const { saving, lastSavedAt } = useAutosave(saveKey, { text, aiUsed }, { setText, setAiUsed });

  const readOnly = useMemo(() => locked || aiUsed, [locked, aiUsed]);
  const words = countWords(text);
  const { meetsRequiredWords, meetsAvoidWords } = checkWords(text);

  useSubmitHotkey(() => setSubmitOpen(true), [setSubmitOpen]);

  const askAIToEdit = async () => {
    if (aiUsed || loading) return;
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
      setAiUsed(true);
    } finally {
      setLoading(false);
    }
  };

  const clearDraft = () => setText("");

  const submit = () => {
    setLocked(true);
    submitData(words, meetsRequiredWords, meetsAvoidWords, text, router);
    send({ type: "SUBMIT_ROUND" });
  };

  const submitDisabled = locked || text.trim().length === 0 || !aiUsed;

  return (
    <main className="min-h-dvh bg-background">
      <RoundHeader workflow="Human → AI" round={run.roundIndex} />
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
              <Button onClick={askAIToEdit} disabled={locked || aiUsed || text.trim().length === 0 || loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Editing...
                  </>
                ) : aiUsed ? (
                  "AI Edit Applied (Locked)"
                ) : (
                  "Ask AI to Edit"
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={clearDraft}
                disabled={locked || text.length === 0 || aiUsed || loading}
              >
                Clear
              </Button>

              <span className="ml-auto text-sm text-muted-foreground">
                {loading
                  ? "Editing with AI..."
                  : aiUsed
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
                {aiUsed ? "AI-edited draft (locked)" : "Your draft"}
              </Label>
              <div className="flex items-center gap-3">
                <AutoSaveIndicator saving={saving} lastSavedAt={lastSavedAt} />
                <span className="text-xs text-muted-foreground">
                  {words} words • {text.length} chars
                </span>
              </div>
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
