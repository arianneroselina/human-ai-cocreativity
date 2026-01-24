"use client";

export type Workflow = 'human' | 'ai' | 'human_ai' | 'ai_human';
export type Phase = 'idle' | 'pre-questionnaire' | 'tutorial' | 'practice' | 'practice_complete' | 'choose_workflow' | 'task' | 'round_feedback' | 'feedback';

export interface ExperimentRun {
  participantId: string | null;
  sessionId: string | null;
  totalRounds: number;
  totalPracticeRounds: number;
  mode: string | null;
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
  {
    key: "human",
    label: "Human",
    title: "Human only",
    desc: "Write entirely on your own without any AI assistance.",
    icon: "✍️"
  },
  {
    key: "ai",
    label: "AI",
    title: "AI only",
    desc: "Chat with the AI, pick a response as your draft, then submit.",
    icon: "🤖"
  },
  {
    key: "human_ai",
    label: "Human→AI",
    title: "You then AI",
    desc: "Write first, then unlock AI to refine or choose from its suggestions.",
    icon: "🧠→🤖"
  },
  {
    key: "ai_human",
    label: "AI→Human",
    title: "AI then you",
    desc: "Start with AI's draft, lock it, then edit and submit your version.",
    icon: "🤖→🧠"
  },
];
