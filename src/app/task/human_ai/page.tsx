"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails, { GeneralAIRules, HumanThenAIRules } from "@/components/ui/taskDetails";
import ConfirmDialog from "@/components/ui/confirm";
import { countWords, checkPoemAgainstRound } from "@/lib/taskChecker";
import { submitData } from "@/lib/submit";
import { usePreventBack } from "@/lib/usePreventBack";
import { useWorkflowGuard } from "@/lib/useWorkflowGuard";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import Rules from "@/components/ui/rules";
import Progress from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import TimerBadge from "@/components/ui/timerBadge";
import { useSubmitHotkey } from "@/components/ui/shortcut";
import { useAutosave } from "@/lib/useAutosave";
import AutoSaveIndicator from "@/components/ui/autosaveIndicator";
import { getTaskIdForRound } from "@/lib/taskAssignment";
import { getPoemTaskById } from "@/data/tasks";

export default function HumanAIPage() {
  useRouteGuard(["task"]);
  useWorkflowGuard();
  usePreventBack(true);

  const { run } = useExperiment();
  const router = useRouter();

  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const saveKey = `draft:${run.sessionId}:${run.roundIndex}:${run.workflow || "n/a"}`;
  const { saving, lastSavedAt } = useAutosave(saveKey, { text, aiUsed }, { setText, setAiUsed });

  const readOnly = useMemo(() => locked || aiUsed, [locked, aiUsed]);
  const [showMessage, setShowMessage] = useState(false);

  const words = countWords(text);

  const task = useMemo(() => {
    if (!run.sessionId) return null;
    const taskId = getTaskIdForRound(run.roundIndex, run.sessionId);
    return getPoemTaskById(taskId);
  }, [run.roundIndex, run.sessionId]);

  const check = useMemo(() => {
    if (!run.sessionId) return null;
    return checkPoemAgainstRound(text, run.roundIndex, run.sessionId);
  }, [text, run.roundIndex, run.sessionId]);

  const forceSubmitOnceRef = useRef(false);
  useSubmitHotkey(() => setSubmitOpen(true), [setSubmitOpen]);

  const askAIToEdit = async () => {
    if (aiUsed || loading) return;
    if (!text.trim()) {
      alert("Please write something first before asking AI to edit.");
      return;
    }
    if (!task) {
      alert("Task not ready yet. Please try again.");
      return;
    }

    setLoading(true);

    const input = [
      `Improve the poem under <TEXT> while preserving its core meaning and voice.`,
      `Follow the task requirements strictly.`,
      ``,
      `TASK:`,
      ...task.taskLines.map((l) => `- ${l}`),
      ``,
      GeneralAIRules.join("\n"),
      HumanThenAIRules.join("\n"),
      ``,
      `<TEXT>`,
      text.trim(),
      `</TEXT>`,
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
    if (!run.sessionId || !check) return;
    setLocked(true);

    submitData(
      {
        sessionId: run.sessionId,
        roundIndex: run.roundIndex,
        workflow: run.workflow,
        text,
        wordCount: words,
        charCount: text.length,
        taskId: check.taskId,
        passed: check.passed,
        requirementResults: check.results,
      },
      router
    );
  };

  const forceSubmit = useCallback(() => {
    if (forceSubmitOnceRef.current) return;
    forceSubmitOnceRef.current = true;

    if (!run.sessionId || !check) return;
    setLocked(true);

    submitData(
      {
        sessionId: run.sessionId,
        roundIndex: run.roundIndex,
        workflow: run.workflow,
        text,
        wordCount: words,
        charCount: text.length,
        taskId: check.taskId,
        passed: check.passed,
        requirementResults: check.results,
      },
      router
    );
  }, [run.sessionId, run.roundIndex, run.workflow, check, text, words, router]);

  const submitDisabled = locked || text.trim().length === 0 || !aiUsed;

  const handleCopyPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-7xl p-6">
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)_220px] items-start gap-3">
            {/* Left ghost spacer */}
            <div className="hidden md:block w-[220px] opacity-0 pointer-events-none select-none" aria-hidden="true" />

            {/* Center content */}
            <div className="min-w-0">
              <div className="mx-auto max-w-4xl">
                <Progress />
                <div className="p-6">
                  <TaskDetails roundIndex={run.roundIndex} sessionId={run.sessionId} />

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

                      <div className="relative">
                        <Textarea
                          id="draft"
                          rows={14}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Write here... then click 'Ask AI to Edit'."
                          readOnly={readOnly}
                          onCopy={handleCopyPaste}
                          onPaste={handleCopyPaste}
                          onCut={handleCopyPaste}
                          className={`${readOnly ? "bg-muted" : "bg-background"} text-foreground placeholder:text-muted-foreground`}
                        />
                        {showMessage && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mt-1 mb-1 bg-black text-white text-xs p-2 rounded-md shadow-md opacity-50 text-center w-auto max-w-xs">
                            Copy, paste, and cut are disabled for this field.
                          </div>
                        )}
                      </div>

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
              </div>
            </div>

            {/* Right dock */}
            <div className="hidden md:block w-[220px] justify-self-end sticky top-6">
              <TimerBadge workflow="Human → AI" seconds={300} active={!locked} onTimeUp={forceSubmit} />
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden fixed right-4 top-40 z-40">
            <TimerBadge workflow="Human → AI" seconds={300} active={!locked} onTimeUp={forceSubmit} />
          </div>
        </div>
      </div>
    </main>
  );
}
