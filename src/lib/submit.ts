"use client";

import { useExperiment } from "@/stores/useExperiment";

type SubmitResult =
  | { ok: true; nextRoute: string }
  | { ok: false; error: string };

export async function submitData(
  words: number,
  meetsRequiredWords: boolean,
  meetsAvoidWords: boolean,
  text: string,
  router: { replace: (path: string) => void; push: (path: string) => void }
): Promise<SubmitResult> {
  localStorage.setItem("wordCount", JSON.stringify(words));
  localStorage.setItem("meetsRequiredWords", JSON.stringify(meetsRequiredWords));
  localStorage.setItem("meetsAvoidWords", JSON.stringify(meetsAvoidWords));

  const { run } = useExperiment.getState();

  if (!run.sessionId || !run.workflow) {
    return { ok: false, error: "missing session/workflow" };
  }

  try {
    const res = await fetch("/api/round/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: run.sessionId,
        roundIndex: run.roundIndex,
        workflow: run.workflow,
        text,
        metrics: { wordCount: words, meetsRequiredWords, meetsAvoidWords },
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      return { ok: false, error: msg || `submit failed (${res.status})` };
    }

    console.log("Round submitted:", {
      sessionId: run.sessionId,
      roundIndex: run.roundIndex,
      workflow: run.workflow,
      text,
      metrics: { wordCount: words, meetsRequiredWords, meetsAvoidWords },
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
