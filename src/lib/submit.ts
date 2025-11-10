"use client"

import { useExperiment } from '@/stores/useExperiment';

export async function submitData(
  words: number,
  meetsRequiredWords: boolean,
  meetsAvoidWords: boolean,
  text: string,
  router: any
) {
  localStorage.setItem("wordCount", JSON.stringify(words));
  localStorage.setItem("meetsRequiredWords", JSON.stringify(meetsRequiredWords));
  localStorage.setItem("meetsAvoidWords", JSON.stringify(meetsAvoidWords));

  const { run } = useExperiment.getState();
  await fetch('/api/round/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: run.sessionId,
      roundIndex: run.roundIndex,
      workflow: run.workflow,
      text,
      metrics: { wordCount: words, meetsRequiredWords, meetsAvoidWords },
    }),
  });

  console.log("Round submitted:", {
    sessionId: run.sessionId,
    roundIndex: run.roundIndex,
    workflow: run.workflow,
    text,
    metrics: { wordCount: words, meetsRequiredWords, meetsAvoidWords },
  });

  useExperiment.getState().send({ type: 'SUBMIT_ROUND' });
  router.push("/feedback/round");
}
