"use client";

import { useState } from "react";
import { useExperiment } from "@/stores/useExperiment";
import { Button } from "@/components/shadcn_ui/button";
import LikertRow, { Likert } from "@/components/ui/likertRow";
import { Workflows, type Workflow } from "@/lib/experiment";
import { Textarea } from "@/components/shadcn_ui/textarea";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { GripVertical } from "lucide-react";

export default function FinalFeedbackPage() {
  useRouteGuard(["feedback"]);

  const { run, send } = useExperiment();

  const [satisfaction, setSatisfaction] = useState<Likert | null>(null);
  const [clarity, setClarity] = useState<Likert | null>(null);
  const [effort, setEffort] = useState<Likert | null>(null);
  const [frustration, setFrustration] = useState<Likert | null>(null);

  const [ranking, setRanking] = useState<Workflow[]>(
    Workflows.map(w => w.key)
  );
  const [dragged, setDragged] = useState<Workflow | null>(null);
  const [rankingReason, setRankingReason] = useState("");
  const MAX_REASON_CHARS = 200;

  const [comment, setComment] = useState("");
  const MAX_COMMENT_CHARS = 1000;

  const canSubmit =
    satisfaction !== null &&
    clarity !== null &&
    effort !== null &&
    frustration !== null &&
    rankingReason.trim().length > 0;

  const onDragStart = (workflow: Workflow) => {
    setDragged(workflow);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (target: Workflow) => {
    if (!dragged || dragged === target) return;

    setRanking(prev => {
      const next = [...prev];
      const from = next.indexOf(dragged);
      const to = next.indexOf(target);
      next.splice(from, 1);
      next.splice(to, 0, dragged);
      return next;
    });

    setDragged(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    await fetch("/api/feedback/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: run.sessionId,
        satisfaction,
        clarity,
        effort,
        frustration,
        workflowRanking: ranking,
        rankingReason,
        comment,
      }),
    });

    console.log("Feedback submitted:", {
      sessionId: run.sessionId,
      satisfaction,
      clarity,
      effort,
      frustration,
      workflowRanking: ranking,
      rankingReason,
      comment,
  });

    send({ type: "FINISH_SESSION" });
  };

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-4xl p-6">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-foreground">
            Final feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Thanks for completing the study. A few final questions:
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-xl">Your experience</h2>

          <div className="mt-6 space-y-6">
            <LikertRow
              label="I am satisfied with my results during the session."
              value={satisfaction}
              onChange={setSatisfaction}
              left="Strongly Disagree"
              right="Strongly Agree"
            />

            <LikertRow
              label="The tasks were clear and easy to understand."
              value={clarity}
              onChange={setClarity}
              left="Strongly Disagree"
              right="Strongly Agree"
            />

            <LikertRow
              label="The study required a lot of effort."
              value={effort}
              onChange={setEffort}
              left="Strongly Disagree"
              right="Strongly Agree"
            />

            <LikertRow
              label="I felt frustrated during the study."
              value={frustration}
              onChange={setFrustration}
              left="Strongly Disagree"
              right="Strongly Agree"
            />

            <div className="space-y-3">
              <h3 className="font-medium text-foreground">
                Please rank the workflows from best (top) to worst (bottom)
              </h3>

              <p className="text-sm text-muted-foreground">
                Drag and reorder the workflows to reflect your preference.
              </p>

              <div className="space-y-2">
                {ranking.map((key, index) => {
                  const wf = Workflows.find(w => w.key === key)!;

                  return (
                    <div
                      key={wf.key}
                      draggable
                      onDragStart={() => onDragStart(wf.key)}
                      onDragOver={onDragOver}
                      onDrop={() => onDrop(wf.key)}
                      className={[
                        "flex items-center gap-3 rounded-md border p-3 bg-background",
                        "cursor-move transition",
                        dragged === wf.key
                          ? "opacity-50"
                          : "hover:bg-accent",
                      ].join(" ")}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />

                      <div className="flex items-center gap-2 text-sm flex-1">
                        <span className="text-base">{wf.icon}</span>
                        <span className="font-medium">{wf.title}</span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Rank {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-foreground">
                Why did you rank the workflows this way?
              </label>
              <Textarea
                rows={3}
                maxLength={MAX_REASON_CHARS}
                value={rankingReason}
                onChange={e =>
                  setRankingReason(e.target.value.slice(0, MAX_REASON_CHARS))
                }
                placeholder="e.g. creativity support, effort required, control, clarity..."
              />
            </div>

            {/* Optional comments */}
            <div className="space-y-2">
              <label className="block text-sm text-foreground">
                Additional comments (optional)
              </label>
              <Textarea
                rows={4}
                maxLength={MAX_COMMENT_CHARS}
                value={comment}
                onChange={e =>
                  setComment(e.target.value.slice(0, MAX_COMMENT_CHARS))
                }
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              Submit feedback
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
