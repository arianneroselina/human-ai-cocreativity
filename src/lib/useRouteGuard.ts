"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useExperiment } from '@/stores/useExperiment';

type PhaseAllow = Array<import('./experiment').Phase>;

export function useRouteGuard(allow: PhaseAllow) {
  const { run } = useExperiment();
  const router = useRouter();

  useEffect(() => {
    console.log(run.phase)
    if (!allow.includes(run.phase)) {
      if (run.phase === 'idle')         router.replace('/');
      else if (run.phase === 'choose_workflow') router.replace('/choose');
      else if (run.phase === 'task') {
        if (!run.workflow || !run.locked) {
          router.replace('/choose');
          return;
        }
        router.replace(`/task/${run.workflow}`);
        return;
      }
      else if (run.phase === 'submit')  router.replace('/submit');
      else if (run.phase === 'feedback') {
        router.replace('/feedback');
      }
    }
  }, [allow, run.phase, run.workflow, run.locked, router]);
}
