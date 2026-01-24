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
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import Rules from "@/components/ui/rules";
import Progress from "@/components/ui/progress";
import TimerBadge from "@/components/ui/timerBadge";
import { useSubmitHotkey } from "@/components/ui/shortcut";
import { useAutosave } from "@/lib/useAutosave";
import AutoSaveIndicator from "@/components/ui/autosaveIndicator";
import AiChatBox from "@/components/ui/aiChatBox";
import { Sparkles } from "lucide-react";
import {Workflows} from "@/lib/experiment";

export default function HumanAIPage() {
  useRouteGuard(["task"]);
  usePreventBack(true);

  const { run } = useExperiment();
  const router = useRouter();

  const [text, setText] = useState("");
  const [aiLocked, setAiLocked] = useState(true);
  const [unlockAi, setUnlockAi] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const saveKey = `draft:${run.sessionId}:${run.roundIndex}:${run.workflow || "n/a"}`;
  const { saving, lastSavedAt } = useAutosave(saveKey, { text, aiLocked }, { setText, setAiLocked });
  const chatKey = `ai-chat:${run.sessionId}:${run.roundIndex}:${run.workflow || "n/a"}`;

  const readOnly = useMemo(() => !aiLocked, [aiLocked]);
  const [showMessage, setShowMessage] = useState(false);

  const MIN_CHARS_FOR_AI = 50;
  const charsLeft = Math.max(0, MIN_CHARS_FOR_AI - text.length);
  const readyForAi = charsLeft === 0;

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

                  {/* Workflow description */}
                  <div className="mb-4 mt-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 p-5 shadow-sm">
                    <p className="font-semibold mb-4 text-purple-900 text-center">
                      {Workflows.find(w => w.key === run.workflow)?.label} workflow
                    </p>

                    <div className="flex items-center gap-3 text-xs">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center gap-1 flex-1 group">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                          <span className="text-lg font-bold">✍️</span>
                        </div>
                        <span className="font-medium text-emerald-900 text-center leading-tight min-h-[2.5ex] px-1">Write draft</span>
                      </div>

                      {/* Arrow */}
                      <div className="w-8 flex justify-center">
                        <div className="w-6 h-1.5 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full shadow-sm"></div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center gap-1 flex-1 group">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 border-2 border-blue-200 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                          <span className="text-lg font-bold">🔓</span>
                        </div>
                        <span className="font-medium text-blue-900 text-center leading-tight min-h-[2.5ex] px-1">Unlock AI (50+ chars)</span>
                      </div>

                      {/* Arrow */}
                      <div className="w-8 flex justify-center">
                        <div className="w-6 h-1.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-sm"></div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center gap-1 flex-1 group">
                        <div className="w-10 h-10 rounded-2xl bg-purple-100 border-2 border-purple-200 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                          <span className="text-lg font-bold">🤖</span>
                        </div>
                        <span className="font-medium text-purple-900 text-center leading-tight min-h-[2.5ex] px-1">Chat & pick AI edit</span>
                      </div>

                      {/* Arrow */}
                      <div className="w-8 flex justify-center">
                        <div className="w-6 h-1.5 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full shadow-sm"></div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex flex-col items-center gap-1 flex-1 group">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                          <span className="text-lg font-bold">✅</span>
                        </div>
                        <span className="font-medium text-indigo-900 text-center leading-tight min-h-[2.5ex] px-1">Submit</span>
                      </div>
                    </div>
                  </div>

                  <AiChatBox
                    mode={run.workflow}
                    aiLocked={aiLocked}
                    defaultOpen={false}
                    onUnlockAi={() => {
                      setAiLocked(false);
                    }}
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
                          Draft {aiLocked ? " (you can edit)" : " (read-only)"}
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

                        <div className="relative group mt-4 flex justify-end">
                          <Button
                            size="lg"
                            disabled={!readyForAi || !aiLocked}
                            className={["px-6 shadow-lg transition-all",
                              readyForAi
                                ? "bg-primary text-primary-foreground animate-pulse"
                                : "bg-muted text-muted-foreground",
                            ].join(" ")}
                            onClick={() => setUnlockAi(true)}
                          >
                            Unlock AI Chat
                            <Sparkles className="h-4 w-4 opacity-95" />
                          </Button>

                          {!readyForAi && (
                            <div
                              className="
                                absolute -top-10 right-0
                                rounded-md bg-black px-3 py-1.5
                                text-xs text-white
                                opacity-0 group-hover:opacity-80
                                transition-opacity
                                pointer-events-none
                                whitespace-nowrap
                              "
                            >
                              Unlocks after {MIN_CHARS_FOR_AI} characters ({charsLeft} to go)
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Rules />

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={clearDraft}
                            disabled={text.trim().length === 0}
                          >
                            Clear
                          </Button>

                          <Button onClick={() => setSubmitOpen(true)} disabled={submitDisabled}>
                            Submit
                          </Button>
                        </div>

                        <ConfirmDialog
                          open={unlockAi}
                          onOpenChange={setAiLocked}
                          title="Unlock AI Chat?"
                          description="After unlocking, you won't be able to edit your draft manually anymore."
                          confirmLabel="Unlock AI"
                          cancelLabel="Cancel"
                          onConfirm={() => {
                            setUnlockAi(false)
                            setAiLocked(false);
                            requestAnimationFrame(() => {
                              document.dispatchEvent(new CustomEvent("open-ai-chat"));
                            });
                          }}
                        />

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
              <TimerBadge
                workflow={run.workflow ? Workflows.find(w => w.key === run.workflow)?.label || "Task" : "Task"}
                seconds={300}
                onTimeUp={forceSubmit}
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden fixed right-4 top-40 z-40">
            <TimerBadge
              workflow={run.workflow ? Workflows.find(w => w.key === run.workflow)?.label || "Task" : "Task"}
              seconds={300}
              onTimeUp={forceSubmit}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
