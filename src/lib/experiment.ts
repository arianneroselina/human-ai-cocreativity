"use client";

export type Workflow = 'human' | 'ai' | 'human_ai' | 'ai_human';
export type Phase = 'idle' | 'pre-questionnaire' | 'tutorial' | 'practice' | 'practice_pause' | 'choose_workflow' | 'task' | 'round_feedback' | 'feedback';

export interface ExperimentRun {
  participantId: string | null;
  sessionId: string | null;
  totalRounds: number;
  totalPracticeRounds: number;
  roundIndex: number;      // 1-based
  workflow?: Workflow;     // chosen for the *current* round
  phase: Phase;
  locked: boolean;         // once true, workflow cannot be changed this round
}

export const Workflows: Array<{
  key: Workflow;
  label: string;
  title: string;
  desc: string;
  icon: string;
}> = [
  { key: "human", label: "Human", title: "Human only", desc: "Write everything yourself. No AI involved.", icon: "✍️" },
  { key: "ai", label: "AI", title: "AI only", desc: "Generate a single AI draft, then submit (read-only).", icon: "🤖" },
  { key: "human_ai", label: "Human→AI", title: "You then AI", desc: "Write first, then AI edits once. Locks after AI.", icon: "🧠→🤖" },
  { key: "ai_human", label: "AI→Human", title: "AI then you", desc: "Start with AI draft once, then you can edit.", icon: "🤖→🧠" },
];
