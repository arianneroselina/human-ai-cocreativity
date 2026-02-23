"use client";

import { useExperiment } from "@/stores/useExperiment";
import { isPracticeMode } from "@/lib/experiment";

export default function Progress() {
  const { run } = useExperiment();

  if (run.phase === "idle") return null;

  const total = isPracticeMode(run.mode) ? run.totalPracticeRounds : run.totalRounds;
  let index = run.roundIndex;
  if (!isPracticeMode(run.mode)) {
    index = run.roundIndex - run.totalPracticeRounds;
  }

  const completed = (() => {
    if (isPracticeMode(run.mode)) {
      switch (run.phase) {
        case "task":
        case "choose_workflow":
        case "round_feedback":
          return Math.max(0, index - 1);
        case "feedback":
          return total;
        default:
          return Math.max(0, index - 1);
      }
    }

    switch (run.phase) {
      case "round_feedback":
        return index;
      case "feedback":
        return total;
      case "choose_workflow":
      case "task":
        return Math.max(0, index - 1);
      default:
        return Math.max(0, index - 1);
    }
  })();

  const pct = Math.round(Math.min(100, Math.max(0, (completed / Math.max(1, total)) * 100)));

  const labelPrefix = isPracticeMode(run.mode) ? "Practice" : "Round";

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 px-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {labelPrefix}: {index} / {total}
        </span>
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
