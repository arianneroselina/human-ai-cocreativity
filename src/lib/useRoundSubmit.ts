"use client";

import { useCallback, useRef } from "react";
import { useExperiment } from "@/stores/useExperiment";
import { CheckResult, RequirementResult } from "@/lib/taskChecker";

type SubmitResult = { ok: true } | { ok: false; error: string };

export type SubmitRoundPayload = {
  sessionId?: string | null;
  roundIndex?: number;
  workflow?: string | undefined;
  taskId: string;

  text: string;
  wordCount: number;
  charCount: number;

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
  localStorage.setItem("passed", JSON.stringify(payload.passed));
  localStorage.setItem("requirementResults", JSON.stringify(payload.requirementResults));

  const { run } = useExperiment.getState();

  const sessionId = payload.sessionId ?? run.sessionId;
  const roundIndex = payload.roundIndex ?? run.roundIndex;
  const workflow = payload.workflow ?? run.workflow;
  const taskId = payload.taskId ?? run.taskId;

  try {
    const res = await fetch("/api/round/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        roundIndex,
        workflow,
        taskId,
        text: payload.text,
        evaluation: {
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

    useExperiment.getState().send({ type: "START_ROUND_FEEDBACK" } as any);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "network error" };
  }
}

type RouterLike = { replace: (path: string) => void; push: (path: string) => void };

type RunLike = {
  sessionId: string | null;
  roundIndex: number;
  workflow?: string;
  taskId?: string;
};

export function useRoundSubmit(args: {
  run: RunLike;
  router: RouterLike;
  text: string;
  words: number;
  check: CheckResult | null;
}) {
  const { run, router, text, words, check } = args;

  // prevents duplicate timer submits
  const forceSubmitOnceRef = useRef(false);

  const submit = useCallback(() => {
    if (!run.sessionId || !check) return;

    submitData(
      {
        sessionId: run.sessionId,
        roundIndex: run.roundIndex,
        workflow: run.workflow,
        taskId: run.taskId!,
        text,
        wordCount: words,
        charCount: text.length,
        passed: check?.passed,
        requirementResults: check.results,
      },
      router
    );
  }, [run.sessionId, run.roundIndex, run.workflow, run.taskId, check, text, words, router]);

  const forceSubmit = useCallback(() => {
    if (forceSubmitOnceRef.current) return;
    forceSubmitOnceRef.current = true;
    submit();
  }, [submit]);

  return { submit, forceSubmit };
}
