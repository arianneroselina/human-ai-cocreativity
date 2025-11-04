"use client";

import { useExperiment } from '@/stores/useExperiment';

export default function Progress() {
  const { run } = useExperiment();

  const completedRounds = (() => {
    switch (run.phase) {
      case 'submit':
        return run.roundIndex;
      case 'feedback':
        return run.totalRounds;
      case 'choose_workflow':
      case 'task':
        return Math.max(0, run.roundIndex - 1);
      case 'idle':
      default:
        return 0;
    }
  })();

  const pct = Math.round(
    Math.min(100, Math.max(0, (completedRounds / Math.max(1, run.totalRounds)) * 100))
  );

  if (run.phase === 'idle') return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 px-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Round {run.roundIndex} / {run.totalRounds}</span>
        <span className="text-foreground">{pct}%</span>
      </div>

      <div
        className="mt-2 h-2 w-full rounded-full overflow-hidden bg-muted"
        role="progressbar"
        aria-label="Session progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="h-full bg-primary rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
