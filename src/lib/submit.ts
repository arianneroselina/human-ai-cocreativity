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
  await fetch('/api/trial/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: run.sessionId,
      trialIndex: run.trialIndex,
      workflow: run.workflow,
      text,
      metrics: { wordCount: words, meetsRequiredWords, meetsAvoidWords },
    }),
  });

  console.log("Trial submitted:", {
    sessionId: run.sessionId,
    trialIndex: run.trialIndex,
    workflow: run.workflow,
    text,
    metrics: { wordCount: words, meetsRequiredWords, meetsAvoidWords },
  });

  useExperiment.getState().send({ type: 'SUBMIT_TRIAL' });
  router.push("/submit");
}
