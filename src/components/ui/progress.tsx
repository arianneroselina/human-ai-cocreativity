"use client";

import { useExperiment } from '@/stores/useExperiment';

export default function Progress() {
  const { run } = useExperiment();

  const completedTrials = (() => {
    switch (run.phase) {
      case 'submit':
        return run.trialIndex;
      case 'feedback':
        return run.totalTrials;
      case 'choose_workflow':
      case 'task':
        return Math.max(0, run.trialIndex - 1);
      case 'idle':
      default:
        return 0;
    }
  })();

  const pct = Math.round(
    Math.min(100, Math.max(0, (completedTrials / Math.max(1, run.totalTrials)) * 100))
  );

  if (run.phase === 'idle') return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-4">
      <div className="flex items-center justify-between text-sm">
        <span>Trial {run.trialIndex} / {run.totalTrials}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[var(--purple)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
