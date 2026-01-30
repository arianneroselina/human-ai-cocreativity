"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useExperiment } from '@/stores/useExperiment';

type PhaseAllow = Array<import('./experiment').Phase>;

export function useRouteGuard(allow: PhaseAllow) {
  const { run } = useExperiment();
  const router = useRouter();

  useEffect(() => {
    if (!allow.includes(run.phase)) {
      if (run.phase === 'idle') router.replace('/');
      else if (run.phase === 'id') router.replace('/id');
      else if (run.phase === 'tutorial') router.replace('/tutorial');
      else if (run.phase === "practice") router.replace("/practice");
      else if (run.phase === "practice_complete") router.replace("/practice/complete");
      else if (run.phase === 'choose_workflow') router.replace('/choose');
      else if (run.phase === 'task') {
        if (!run.workflow || !run.locked) {
          if (run.mode === "practice") router.replace("/practice");
          else router.replace("/choose");
          return;
        }
        router.replace(`/task/${run.workflow}`);
        return;
      }
      else if (run.phase === 'round_feedback') router.replace('/feedback/round');
      else if (run.phase === 'feedback') router.replace('/feedback/session');
      else if (run.phase === 'finish') router.replace('/finish');
      else router.replace("/"); // fallback
    }
  }, [allow, run.phase, run.workflow, run.locked, router, run]);
}
