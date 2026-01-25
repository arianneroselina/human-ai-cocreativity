import { Workflow, WORKFLOW_VALUES } from "@/lib/experiment";
import { POEM_TASKS } from "@/data/tasks";

export type RoundAssignment = {
  taskId: string;
  workflow: Workflow | null; // null = user chooses
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createRandomAssignments(opts: {
  totalPracticeRounds: number;
  totalMainRounds: number;
}): RoundAssignment[] {
  const { totalPracticeRounds, totalMainRounds } = opts;

  let taskPool = shuffle(POEM_TASKS.map((t) => t.id));
  let workflowPool = shuffle(WORKFLOW_VALUES);

  let taskIndex = 0;
  let workflowIndex = 0;

  const assignments: RoundAssignment[] = [];

  function nextTask(): string {
    if (taskIndex >= taskPool.length) {
      taskPool = shuffle(taskPool); // reshuffle only after exhaustion
      taskIndex = 0;
    }
    return taskPool[taskIndex++];
  }

  function nextWorkflow(): Workflow {
    if (workflowIndex >= workflowPool.length) {
      workflowPool = shuffle(workflowPool);
      workflowIndex = 0;
    }
    return workflowPool[workflowIndex++] as Workflow;
  }

  // practice rounds
  for (let i = 0; i < totalPracticeRounds; i++) {
    assignments.push({
      taskId: nextTask(),
      workflow: nextWorkflow(),
    });
  }

  // main rounds
  for (let i = 0; i < totalMainRounds; i++) {
    assignments.push({
      taskId: nextTask(),
      workflow: null, // user decides
    });
  }

  return assignments;
}
