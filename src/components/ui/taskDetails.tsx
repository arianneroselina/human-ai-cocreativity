"use client";

import { useMemo } from "react";
import { getPoemTaskById } from "@/data/tasks";

export default function TaskDetails({ taskId }: {
  taskId: string
}) {
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
      </div>

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
    </section>
  );
}
