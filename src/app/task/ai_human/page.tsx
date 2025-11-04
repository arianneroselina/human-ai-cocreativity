"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails, { GeneralAIRules, Task } from "@/components/ui/taskDetails";
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

export default function AIHumanWorkPage() {
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

  const saveKey = `draft:${run.sessionId}:${run.roundIndex}:${run.workflow || "n/a"}`;
  const { saving, lastSavedAt } = useAutosave(saveKey, { text, aiUsed }, { setText, setAiUsed });

  // readOnly until AI generates; afterward editable (unless locked)
  const readOnly = useMemo(() => locked || !aiUsed, [locked, aiUsed]);
  const words = countWords(text);
  const { meetsRequiredWords, meetsAvoidWords } = checkWords(text);

  useSubmitHotkey(() => setSubmitOpen(true), [setSubmitOpen]);

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
      setAiUsed(true); // enable editing
    } finally {
      setLoading(false);
    }
  };

  const clearDraft = () => setText("");

  const submit = () => {
    setLocked(true);
    submitData(words, meetsRequiredWords, meetsAvoidWords, text, router);
    send({ type: 'SUBMIT_TRIAL' });
  };

  const submitDisabled = locked || text.trim().length === 0 || !aiUsed;

  return (
    <main className="min-h-dvh bg-background">
      <RoundHeader workflow="AI → Human" round={run.roundIndex} />
      <Progress />

      <div className="mx-auto max-w-4xl p-6">
        {/* Info */}
        <TaskDetails />

        {/* Actions */}
        <section className="mt-4">
          <div className="items-center rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">
              Generate an AI draft <span className="font-medium text-foreground">once</span>, then edit freely. AI is disabled afterwards.
            </p>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={generateAiDraft} disabled={locked || aiUsed || loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : aiUsed ? (
                  "AI Draft Generated (AI Disabled)"
                ) : (
                  "Generate AI Draft"
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={clearDraft}
                disabled={locked || text.length === 0 || loading}
              >
                Clear
              </Button>

              <span className="ml-auto text-sm text-muted-foreground">
                {loading
                  ? "Generating draft..."
                  : aiUsed
                    ? "You can edit now. AI is disabled."
                    : "Generate the AI draft to begin."}
              </span>
            </div>
          </div>
        </section>

        {/* Editor */}
        <section className="mt-4">
          <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="draft" className="text-sm font-medium">
                {aiUsed ? "Draft (you can edit)" : "AI draft will appear here"}
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
              placeholder={aiUsed ? "You can now edit the AI draft..." : "Click 'Generate AI Draft' to start..."}
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
