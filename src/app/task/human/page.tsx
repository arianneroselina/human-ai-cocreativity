"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails from "@/components/ui/taskDetails";
import ConfirmDialog from "@/components/ui/confirm";
import { countWords, checkWords } from "@/lib/check";
import { submitData } from "@/lib/submit";
import { usePreventBack } from "@/lib/usePreventBack";
import { useWorkflowGuard } from "@/lib/useWorkflowGuard";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import Rules from "@/components/ui/rules";
import Progress from "@/components/ui/progress";
import RoundHeader from "@/components/ui/roundHeader";
import { useSubmitHotkey } from "@/components/ui/shortcut";
import { useAutosave } from "@/lib/useAutosave";
import AutoSaveIndicator from "@/components/ui/autosaveIndicator";

export default function HumanPage() {
  useRouteGuard(["task"]);
  useWorkflowGuard();
  usePreventBack(true);

  const { run, send } = useExperiment();
  const router = useRouter();

  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const saveKey = `draft:${run.sessionId}:${run.roundIndex}:${run.workflow || "n/a"}`;
  const { saving, lastSavedAt } = useAutosave(saveKey, { text }, { setText });

  const readOnly = useMemo(() => locked, [locked]);
  const [showMessage, setShowMessage] = useState(false);
  const words = countWords(text);
  const { meetsRequiredWords, meetsAvoidWords } = checkWords(text);

  useSubmitHotkey(() => setSubmitOpen(true), [setSubmitOpen]);

  const clearDraft = () => setText("");

  const submit = () => {
    setLocked(true);
    submitData(words, meetsRequiredWords, meetsAvoidWords, text, router);
    send({ type: "SUBMIT_ROUND" });
  };

  const submitDisabled = locked || text.trim().length === 0;

  const handleCopyPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  return (
    <main className="min-h-dvh bg-background">
      <RoundHeader workflow="Human only" round={run.roundIndex} />
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
                placeholder="Write here..."
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
