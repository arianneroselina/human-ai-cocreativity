"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails from "@/components/ui/taskDetails";
import ConfirmDialog from "@/components/ui/confirm";
import { countWords, checkPoemAgainstRound } from "@/lib/taskChecker";
import { useRoundSubmit } from "@/lib/useRoundSubmit";
import { usePreventBack } from "@/lib/usePreventBack";
import { useWorkflowGuard } from "@/lib/useWorkflowGuard";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import Rules from "@/components/ui/rules";
import Progress from "@/components/ui/progress";
import TimerBadge from "@/components/ui/timerBadge";
import { useSubmitHotkey } from "@/components/ui/shortcut";
import { useAutosave } from "@/lib/useAutosave";
import AutoSaveIndicator from "@/components/ui/autosaveIndicator";
import AiChatBox from "@/components/ui/aiChatBox";

export default function HumanAIPage() {
  useRouteGuard(["task"]);
  useWorkflowGuard();
  usePreventBack(true);

  const { run } = useExperiment();
  const router = useRouter();

  const [text, setText] = useState("");
  const [aiLocked, setAiLocked] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);

  const saveKey = `draft:${run.sessionId}:${run.roundIndex}:${run.workflow || "n/a"}`;
  const { saving, lastSavedAt } = useAutosave(saveKey, { text, aiLocked }, { setText, setAiLocked });
  const chatKey = `ai-chat:${run.sessionId}:${run.roundIndex}:${run.workflow || "n/a"}`;

  const readOnly = useMemo(() => !aiLocked, [aiLocked]);
  const [showMessage, setShowMessage] = useState(false);

  const words = countWords(text);

  const check = useMemo(() => {
    if (!run.sessionId) return null;
    return checkPoemAgainstRound(text, run.roundIndex, run.sessionId);
  }, [text, run.roundIndex, run.sessionId]);

  const clearDraft = () => setText("");

  useSubmitHotkey(() => setSubmitOpen(true), [setSubmitOpen]);

  const { submit, forceSubmit } = useRoundSubmit({
    run,
    router,
    text,
    words,
    check,
  });

  const submitDisabled = aiLocked || text.trim().length === 0;

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

                  <AiChatBox
                    mode="HUMAN_TO_AI"
                    aiLocked={aiLocked}
                    defaultOpen={false}
                    onUnlockAi={() => {setAiLocked(false);}}
                    onLockAi={() => {setAiLocked(true);}}
                    onDraft={(draft) => {setText(draft);}}
                    baseHumanText={text}
                    storageKey={chatKey}
                  />

                  {/* Editor */}
                  <section className="mt-4">
                    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <Label htmlFor="draft" className="text-sm font-medium">
                          {aiLocked ? "Your Draft (you can edit)" : "Your AI Draft (read-only)"}
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
                          placeholder={
                            aiLocked
                              ? "Write your draft. When ready, unlock AI to get AI edit your draft."
                              : "AI is editing. Please wait."
                            }
                          readOnly={readOnly}
                          onCopy={handleCopyPaste}
                          onPaste={handleCopyPaste}
                          onCut={handleCopyPaste}
                          className={`${readOnly ? "bg-muted text-muted-foreground" : "bg-background text-foreground"} placeholder:text-muted-foreground`}
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
              <TimerBadge workflow="Human → AI" seconds={300} onTimeUp={forceSubmit} />
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden fixed right-4 top-40 z-40">
            <TimerBadge workflow="Human → AI" seconds={300} onTimeUp={forceSubmit} />
          </div>
        </div>
      </div>
    </main>
  );
}
