"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useExperiment } from '@/stores/useExperiment';

export function useWorkflowGuard() {
  const { run } = useExperiment();
  const router = useRouter();
  const path = usePathname();             // e.g. "/task/ai"
  const choice = path.split('/').pop()!;  // "ai"

  useEffect(() => {
    // If no session yet
    if (run.phase === 'idle') {
      router.replace('/');
      return;
    }
    // Must lock a workflow before visiting /task/*
    if (run.phase === 'choose_workflow' || !run.locked || !run.workflow) {
      router.replace('/choose');
      return;
    }
    // During 'task', enforce correct workflow route
    if (run.phase === 'task') {
      if (choice !== run.workflow) {
        router.replace(`/task/${run.workflow}`);
        return;
      }
    }
    // If not in task anymore, bounce to the right phase screen
    if (run.phase === 'round_feedback') router.replace('/feedback/round');
    if (run.phase === 'feedback') router.replace('/feedback/session');
  }, [run.phase, run.locked, run.workflow, router, choice]);
}
