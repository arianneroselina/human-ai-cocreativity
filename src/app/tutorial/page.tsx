"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails from "@/components/ui/taskDetails";
import { countWords } from "@/lib/taskChecker";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import Rules from "@/components/ui/rules";
import Progress from "@/components/ui/progress";
import TimerBadge from "@/components/ui/timerBadge";
import { useAutosave } from "@/lib/useAutosave";
import AutoSaveIndicator from "@/components/ui/autosaveIndicator";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Workflows } from "@/lib/experiment";
import AiChatBox from "@/components/ui/aiChatBox";

type CoachStep = {
  targetId: string;
  title: string;
  text: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function TutorialPage() {
  useRouteGuard(["tutorial"]);

  const { run, send } = useExperiment();

  const [text, setText] = useState("");
  const [showCopyMsg, setShowCopyMsg] = useState(false);
  const [showSubmitMsg, setShowSubmitMsg] = useState(false);

  const draftRef = useRef<HTMLTextAreaElement | null>(null);

  const saveKey = `tutorial:draft:${run.sessionId ?? "no-session"}`;
  const { saving, lastSavedAt } = useAutosave(saveKey, { text }, { setText });

  const words = countWords(text);

  // disable scrolling
  useEffect(() => {
    const el = document.getElementById("app-main");
    if (!el) return;

    const prev = el.style.overflowY;
    el.style.overflowY = "hidden";

    return () => { el.style.overflowY = prev; };
  }, []);

  const steps: CoachStep[] = useMemo(
    () => [
      {
        targetId: "tut-page",
        title: "Welcome",
        text: "Quick walkthrough. Click Next.",
      },
      {
        targetId: "tut-timer",
        title: "Workflow & Timer",
        text: "This area shows your current workflow type and how much time you have left in this round. Keep an eye on it.",
      },
      {
        targetId: "tut-instructions",
        title: "Workflow steps",
        text: "Your workflow is e.g. 'Human→AI', and here are the steps you need to complete.",
      },
      {
        targetId: "tut-task",
        title: "Task prompt",
        text: "Read the task description here: what you should write and all specific requirements.",
      },
      {
        targetId: "tut-status",
        title: "Autosave & Counters",
        text: "This shows when your draft was last saved, plus word and character counts.",
      },
      {
        targetId: "tut-editor",
        title: "Write your draft",
        text: "Type your answer here. When AI is active, this editor is read-only.",
      },
      {
        targetId: "tut-ai-chat",
        title: "AI Chat Box",
        text: "In AI-assisted workflows, you can chat with the AI and select a response to use as your draft.",
      },
      {
        targetId: "tut-submit",
        title: "Submit",
        text: "Submit is enabled even if you haven't met the requirements yet. So check the prompt and do your best before submitting.",
      },
    ],
    []
  );

  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx];

  const [coachVisible, setCoachVisible] = useState(true);

  const [rect, setRect] = useState<DOMRect | null>(null);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const rafRef = useRef<number | null>(null);

  const [vp, setVp] = useState({ w: 0, h: 0 });

  const [aiLocked, setAiLocked] = useState<boolean>(true);

  useEffect(() => {
    if (step.targetId === "tut-ai-chat") {
      setAiLocked(false)
    } else if (!aiLocked) {
      setAiLocked(true)
    }
  }, [aiLocked, step.targetId]);

  const measure = () => {
    const el = document.getElementById(step.targetId);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect(r);

    const preferBottom = r.bottom + 190 < window.innerHeight;
    setPlacement(preferBottom ? "bottom" : "top");
  };

  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!coachVisible) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    const onResize = () => {
      if (!coachVisible) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [coachVisible, stepIdx]);

  useEffect(() => {
    const el = document.getElementById(step.targetId);
    setCoachVisible(false);

    if (!el) {
      setRect(null);
      setCoachVisible(true);
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const t = window.setTimeout(() => {
      measure();
      setCoachVisible(true);

      if (step.targetId === "tut-editor") {
        draftRef.current?.focus();
      }
    }, 300);

    return () => window.clearTimeout(t);
  }, [stepIdx]);

  useEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    send({ type: "START_PRACTICE" });
  };

  const next = () => {
    setCoachVisible(false);
    if (stepIdx >= steps.length - 1) finish();
    else setStepIdx((s) => s + 1);
  };

  const prev = () => setStepIdx((s) => Math.max(0, s - 1));

  const handleCopyPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setShowCopyMsg(true);
    setTimeout(() => setShowCopyMsg(false), 1400);
  };

  const onTutorialSubmit = () => {
    // In tutorial we don't submit / navigate.
    setShowSubmitMsg(true);
    setTimeout(() => setShowSubmitMsg(false), 1600);
  };

  const tooltipStyle = (() => {
    if (!rect || vp.w === 0) return { top: 24, left: 24 } as React.CSSProperties;

    const pad = 12;
    const maxW = 360;

    const left = clamp(rect.left, 16, vp.w - maxW - 16);
    const top =
      placement === "bottom"
        ? clamp(rect.bottom + pad, 16, vp.h - 200)
        : clamp(rect.top - pad - 150, 16, vp.h - 200);

    return { top, left } as React.CSSProperties;
  })();

  const isFirst = stepIdx === 0;
  const isLast = stepIdx === steps.length - 1;

  return (
    <main className="min-h-dvh bg-background">
      <div className="tut-page mx-auto w-full max-w-7xl p-6">
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)_220px] items-start gap-3">
            {/* Left ghost spacer */}
            <div
              className="hidden md:block w-[220px] opacity-0 pointer-events-none select-none"
              aria-hidden="true"
            />

            {/* Center content */}
            <div className="min-w-0">
              <div className="mx-auto max-w-4xl">
                <Progress />

                <div className="p-6">
                  <section className="mt-4" id="tut-instructions">
                    <div
                      className={[
                        "mb-3 mt-3 rounded-xl p-3 shadow-2xl",
                        "border border-border/60",
                        "bg-gradient-to-r from-primary/10 via-primary/5 to-background",
                      ].join(" ")}
                    >
                      {/* Title + description */}
                      <div className="text-center mb-3">
                        <p className="font-semibold text-sm text-foreground">
                          {Workflows.find(w => w.key === "human_ai")?.label} workflow
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {Workflows.find(w => w.key === "human_ai")?.desc}
                        </p>
                      </div>

                      {/* Steps */}
                      <div className="flex items-center gap-2 text-[11px]">
                        {[
                          { icon: "✍️", label: "Write draft" },
                          { icon: "🔓", label: "Unlock AI" },
                          { icon: "🤖", label: "Chat & pick edit" },
                          { icon: "✅", label: "Submit" },
                        ].map((step, i) => (
                          <React.Fragment key={step.label}>
                            <div className="flex flex-col items-center gap-0.5 flex-1">
                              <div
                                className={[
                                  "w-8 h-8 rounded-xl flex items-center justify-center",
                                  "border border-border/60 shadow-md transition-all",
                                  "bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40",
                                  "text-primary-foreground text-sm group-hover:shadow-lg",
                                ].join(" ")}
                              >
                                {step.icon}
                              </div>
                              <span className="font-medium text-foreground leading-tight text-center">
                              {step.label}
                            </span>
                            </div>

                            {i < 3 && (
                              <div className="w-4 flex justify-center">
                                <div className="w-4 h-1 rounded-full bg-primary/40" />
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </section>

                  <div id="tut-task">
                    <TaskDetails taskId={run.taskId!} />
                  </div>

                  <AiChatBox
                    workflow="human_ai"
                    aiLocked={aiLocked}
                    onDraft={(draft) => {setText(draft);}}
                    tutorialId="tut-ai-chat"
                  />

                  <section className="mt-4">
                    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <Label htmlFor="draft" className="text-sm font-medium">
                          Draft
                        </Label>
                        <div className="flex items-center gap-3" id="tut-status">
                          <AutoSaveIndicator saving={saving} lastSavedAt={lastSavedAt} />
                          <span className="text-xs text-muted-foreground">
                            {words} words • {text.length} chars
                          </span>
                        </div>
                      </div>

                      <div className="relative" id="tut-editor">
                        <Textarea
                          ref={(el) => {
                            draftRef.current = el;
                          }}
                          id="draft"
                          rows={14}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Write here..."
                          readOnly={false}
                          onCopy={handleCopyPaste}
                          onPaste={handleCopyPaste}
                          onCut={handleCopyPaste}
                          className="bg-background text-foreground placeholder:text-muted-foreground"
                        />

                        {showCopyMsg && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-md bg-black/70 px-3 py-2 text-xs text-white shadow-md">
                            Copy/paste/cut disabled.
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        {/* keep Rules visible (real UI), but no tutorial step for it */}
                        <Rules />

                        <div className="flex gap-2" id="tut-submit">
                          <Button
                            variant="secondary"
                            onClick={() => setText("")}
                            disabled={text.length === 0}
                          >
                            Clear
                          </Button>

                          {/* looks enabled in tutorial */}
                          <Button onClick={onTutorialSubmit}>Submit</Button>
                        </div>
                      </div>

                      {showSubmitMsg && (
                        <div className="mt-3 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                          Tutorial only — in real rounds, Submit is enabled even if requirements aren&#39;t met.
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div className="hidden md:block w-[220px] justify-self-end sticky top-6">
              <div id="tut-timer">
                <TimerBadge
                  workflow="Human→AI"
                  demo
                />
              </div>
            </div>
          </div>

          {/* Mobile: keep it on the right */}
          <div className="md:hidden fixed right-4 top-40 z-40">
            <div id="tut-timer">
              <TimerBadge
                workflow="Human→AI"
                demo
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coach overlay */}
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Spotlight */}
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Transparent hole (black in mask means "hide") */}
              {rect && coachVisible && (
                <rect
                  x={Math.max(0, rect.left - 10)}
                  y={Math.max(0, rect.top - 10)}
                  width={Math.max(0, rect.width + 20)}
                  height={Math.max(0, rect.height + 20)}
                  rx="14"
                  ry="14"
                  fill="black"
                />
              )}
            </mask>

            {/* Optional soft glow filter */}
            <filter id="spotlight-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dim layer, with mask hole */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.55)"
            mask="url(#spotlight-mask)"
          />

          {/* Stroke ring around hole */}
          {rect && coachVisible && (
            <rect
              x={Math.max(0, rect.left - 10)}
              y={Math.max(0, rect.top - 10)}
              width={Math.max(0, rect.width + 20)}
              height={Math.max(0, rect.height + 20)}
              rx="14"
              ry="14"
              fill="transparent"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              filter="url(#spotlight-glow)"
            />
          )}
        </svg>

        {/* Tooltip */}
        {coachVisible && (
          <div
            className="absolute w-[360px] rounded-xl border border-border bg-card p-4 shadow-lg pointer-events-auto"
            style={tooltipStyle}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">{step.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{step.text}</div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                {stepIdx + 1}/{steps.length}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <Button
                    variant="secondary"
                    onClick={prev}
                    className="inline-flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}

                <Button onClick={next} className="inline-flex items-center gap-2">
                  {isLast ? "Finish" : "Next"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
