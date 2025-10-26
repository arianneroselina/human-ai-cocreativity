"use client";

export type Workflow = 'human' | 'ai' | 'human_ai' | 'ai_human';
export type Phase = 'idle' | 'choose_workflow' | 'task' | 'submit' | 'feedback';

export interface ExperimentRun {
  participantId: string | null;
  sessionId: string | null;
  totalTrials: number;
  trialIndex: number;      // 1-based
  workflow?: Workflow;     // chosen for the *current* trial
  taskId?: string;         // current task
  phase: Phase;
  locked: boolean;         // once true, workflow cannot be changed this trial
}
