"use client";

import { useCallback, useRef } from "react";
import { useExperiment } from "@/stores/useExperiment";
import type { RequirementResult } from "@/lib/taskChecker";

type SubmitResult =
  | { ok: true; nextRoute: string }
  | { ok: false; error: string };

export type SubmitRoundPayload = {
  sessionId?: string | null;
  roundIndex?: number;
  workflow?: string | undefined;

  text: string;
  wordCount: number;
  charCount: number;

  taskId: string;
  passed: boolean;
  requirementResults: RequirementResult[];
};

export async function submitData(
  payload: SubmitRoundPayload,
  router: { replace: (path: string) => void; push: (path: string) => void }
): Promise<SubmitResult> {
  console.log("submitData", { payload, router });

  // local storage (client-side)
  localStorage.setItem("wordCount", JSON.stringify(payload.wordCount));
  localStorage.setItem("charCount", JSON.stringify(payload.charCount));
  localStorage.setItem("taskId", JSON.stringify(payload.taskId));
  localStorage.setItem("passed", JSON.stringify(payload.passed));
  localStorage.setItem("requirementResults", JSON.stringify(payload.requirementResults));

  const { run } = useExperiment.getState();

  const sessionId = payload.sessionId ?? run.sessionId;
  const roundIndex = payload.roundIndex ?? run.roundIndex;
  const workflow = payload.workflow ?? run.workflow;

  if (!sessionId || !roundIndex || !workflow) {
    return { ok: false, error: "missing session/workflow/roundIndex" };
  }

  try {
    const res = await fetch("/api/round/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        roundIndex,
        workflow,
        text: payload.text,
        evaluation: {
          taskId: payload.taskId,
          passed: payload.passed,
          requirementResults: payload.requirementResults,
        },
        metrics: {
          wordCount: payload.wordCount,
          charCount: payload.charCount,
        },
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      return { ok: false, error: msg || `submit failed (${res.status})` };
    }

    console.log("Round submitted:", {
      sessionId,
      roundIndex,
      workflow,
      text: payload.text,
      evaluation: {
        taskId: payload.taskId,
        passed: payload.passed,
        requirementResults: payload.requirementResults,
      },
      metrics: {
        wordCount: payload.wordCount,
        charCount: payload.charCount,
      },
    });

    useExperiment.getState().send({ type: "SUBMIT_ROUND" } as any);

    const nextPhase = useExperiment.getState().run.phase;
    const nextRoute =
      nextPhase === "practice_pause"
        ? "/practice/pause"
        : nextPhase === "round_feedback"
          ? "/feedback/round"
          : "/choose";

    router.replace(nextRoute);

    return { ok: true, nextRoute };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "network error" };
  }
}

export type RoundCheckResult = {
  taskId: string;
  passed: boolean;
  results: RequirementResult[];
} | null;

type RouterLike = { replace: (path: string) => void; push: (path: string) => void };

type RunLike = {
  sessionId: string | null;
  roundIndex: number;
  workflow?: string;
};

export function useRoundSubmit(args: {
  run: RunLike;
  router: RouterLike;
  text: string;
  words: number;
  check: RoundCheckResult;
  setLocked: (v: boolean) => void;
}) {
  const { run, router, text, words, check, setLocked } = args;

  // prevents duplicate timer submits
  const forceSubmitOnceRef = useRef(false);

  const submit = useCallback(() => {
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
  }, [
    run.sessionId,
    run.roundIndex,
    run.workflow,
    check,
    text,
    words,
    router,
    setLocked,
  ]);

  const forceSubmit = useCallback(() => {
    if (forceSubmitOnceRef.current) return;
    forceSubmitOnceRef.current = true;
    submit();
  }, [submit]);

  return { submit, forceSubmit };
}
