"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/shadcn_ui/button";
import { getPoemTaskById } from "@/data/tasks";
import { getTaskIdForRound } from "@/lib/taskAssignment";

export const Task = [
  `Write a short poem about a tired student at university. Use the following guidelines:`,
  `Minimum 50 words, maximum 100 words.`,
  `Use at least 3 of the following words:\n` +
  `"Tired", "University", "Books", "Sleepless", "Stress", "Midnight", "Coffee", "Assignment", "Brain", "Overwhelmed".`,
  `Do not use the word "study" or mention specific subjects.`,
  `Your poem can be serious, humorous, or reflective. Experiment with rhyme and rhythm to convey the tired student's emotions.`,
];

export const AntiTask = [
  `Write a short poem about a tired student at university. Use the following guidelines:`,
  `Minimum 50 words, maximum 100 words.`,
  `Use only 2 of the following words:\n` +
  `"Tired", "University", "Books", "Sleepless", "Stress", "Midnight", "Coffee", "Assignment", "Brain", "Overwhelmed".`,
  `Use the word "study" or mention specific subjects.`,
  `Your poem can be serious, humorous, or reflective. Experiment with rhyme and rhythm to convey the tired student's emotions.`,
];

export const HumanThenAIRules = [
  `Goals:`,
  `- Strengthen imagery and specificity.`,
  `- Improve rhythm and line breaks; prefer natural cadence over forced rhyme.`,
  `- Remove clichés and filler; tighten wording.`,
  `- Maintain language of the original text.`,
  `- Keep length within ±10% of original.`,
  `- Follow the predefined guidelines.`,
  `Additional Rules:`,
  `1) Do NOT invent new narrative events; refine what's there.`,
];

export const GeneralAIRules = [
  `General Rules:`,
  `1) Do NOT add explanations, titles, or commentary.`,
  `2) If a requirement conflicts with goals, requirements win.`,
  `3) Output ONLY the final edited poem—no markdown fences.`,
];

type TaskDetailsProps = {
  roundIndex: number; // 1..7
  sessionId:  string | null;
};

export default function TaskDetails({ roundIndex, sessionId }: TaskDetailsProps) {
  const [open, setOpen] = useState(true);
  const [taskId, setTaskId] = useState<string | null>(null);

  useEffect(() => {
    const id = getTaskIdForRound(roundIndex, sessionId!);
    setTaskId(id);
  }, [roundIndex, sessionId]);

  const task = useMemo(() => (taskId ? getPoemTaskById(taskId) : null), [taskId]);

  if (!task) {
    return (
      <section className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Task: Loading…</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mt-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Title: {task.title}
        </h2>
        <Button
          variant="ghost"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Hide Task Details" : "Show Task Details"}
          className="text-muted-foreground"
        >
          {open ? "▲" : "▼"}
        </Button>
      </div>

      {open && (
        <div className="mt-4">
          <p className="mt-2 text-sm text-muted-foreground">{task.intro}</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {task.uiItems.map((item, idx) => (
              <div key={`${task.id}-${idx}`} className="flex items-start gap-3 rounded-md border border-border/60 p-3">
                <span className="text-xl text-primary">{item.icon}</span>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground">{item.heading}</h3>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
