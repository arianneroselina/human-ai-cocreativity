"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails from "@/components/ui/taskDetails";
import { countWords, checkWords } from "@/lib/check";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import Rules from "@/components/ui/rules";
import Progress from "@/components/ui/progress";
import TimerBadge from "@/components/ui/timerBadge";
import { useAutosave } from "@/lib/useAutosave";
import AutoSaveIndicator from "@/components/ui/autosaveIndicator";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const router = useRouter();
  const { run, send } = useExperiment();

  const [text, setText] = useState("");
  const [showCopyMsg, setShowCopyMsg] = useState(false);
  const [showSubmitMsg, setShowSubmitMsg] = useState(false);

  const draftRef = useRef<HTMLTextAreaElement | null>(null);

  const saveKey = `tutorial:draft:${run.sessionId ?? "no-session"}`;
  const { saving, lastSavedAt } = useAutosave(saveKey, { text }, { setText });

  const words = countWords(text);
  checkWords(text);

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
        targetId: "tut-task",
        title: "Task prompt",
        text: "Read the task here: what to write, and any required/avoid words.",
      },
      {
        targetId: "tut-instructions",
        title: "Workflow rule",
        text: "Human-only means: write by yourself. No AI assistance during this workflow.",
      },
      {
        targetId: "tut-status",
        title: "Autosave & Counters",
        text: "This shows when your draft was last saved, plus word and character counts.",
      },
      {
        targetId: "tut-editor",
        title: "Write your draft",
        text: "Type your answer here. You can edit freely until you submit.",
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

  const [rect, setRect] = useState<DOMRect | null>(null);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const rafRef = useRef<number | null>(null);

  const [vp, setVp] = useState({ w: 0, h: 0 });

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    const onResize = () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  useEffect(() => {
    const el = document.getElementById(step.targetId);

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      const t = window.setTimeout(() => measure(), 250);

      if (step.targetId === "tut-editor") {
        window.setTimeout(() => draftRef.current?.focus(), 280);
      }

      return () => window.clearTimeout(t);
    } else {
      setRect(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  useEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    send({ type: "FINISH_TUTORIAL" } as any);
    router.replace("/practice");
  };

  const next = () => {
    if (stepIdx >= steps.length - 1) finish();
    else setStepIdx((s) => s + 1);
  };

  const prev = () => setStepIdx((s) => Math.max(0, s - 1));
  const skip = () => finish();

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

  const highlightStyle = (() => {
    if (!rect) return { display: "none" } as React.CSSProperties;
    const pad = 8;
    return {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    } as React.CSSProperties;
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
                  <div id="tut-task">
                    <TaskDetails />
                  </div>

                  <section className="mt-4" id="tut-instructions">
                    <div className="items-center rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
                      <p className="text-sm text-muted-foreground">
                        Write entirely by yourself.{" "}
                        <span className="font-medium text-foreground">No AI available.</span>
                      </p>
                    </div>
                  </section>

                  <section className="mt-4">
                    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <Label htmlFor="draft" className="text-sm font-medium">
                          Your draft
                        </Label>

                        {/* ✅ tutorial step target */}
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
                          Tutorial only — in real rounds, Submit is enabled even if requirements aren’t met.
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div className="hidden md:block w-[220px] justify-self-end sticky top-6">
              <div id="tut-timer">
                <TimerBadge workflow="Human only" seconds={300}/>
              </div>
            </div>
          </div>

          {/* Mobile: keep it on the right */}
          <div className="md:hidden fixed right-4 top-40 z-40">
            <div id="tut-timer">
              <TimerBadge workflow="Human only" seconds={300}/>
            </div>
          </div>
        </div>
      </div>

      {/* Coach overlay */}
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <div className="absolute inset-0 bg-black/40" />

        <div
          className="absolute rounded-xl border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.0)]"
          style={highlightStyle}
        />

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
            <Button variant="secondary" onClick={skip}>
              Skip
            </Button>

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
      </div>
    </main>
  );
}
