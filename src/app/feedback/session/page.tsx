"use client";

import { useState, useMemo } from "react";
import { useExperiment } from "@/stores/useExperiment";
import { Button } from "@/components/shadcn_ui/button";
import LikertRow, { Likert } from "@/components/ui/likertRow";
import { Workflows, type Workflow } from "@/lib/experiment";
import { Textarea } from "@/components/shadcn_ui/textarea";

export default function FeedbackForm() {
  const { run, send } = useExperiment();

  const [satisfaction, setSatisfaction] = useState<Likert | null>(null);
  const [clarity, setClarity] = useState<Likert | null>(null);
  const [effort, setEffort] = useState<Likert | null>(null);
  const [frustration, setFrustration] = useState<Likert | null>(null);

  const [bestWorkflow, setBestWorkflow] = useState<Workflow | null>(null);
  const [bestWorkflowReason, setBestWorkflowReason] = useState("");
  const MAX_REASON_CHARS = 200;

  const [comment, setComment] = useState("");
  const MAX_COMMENT_CHARS = 1000;

  const canSubmit =
    satisfaction !== null &&
    clarity !== null &&
    effort !== null &&
    frustration !== null &&
    bestWorkflow !== null &&
    bestWorkflowReason.trim().length > 0;

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
        bestWorkflow,
        bestWorkflowReason,
        comment,
      }),
    });

    send({ type: "FINISH_SESSION" });
  };

  return (
    <section className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm">
      <h2 className="font-semibold text-xl text-foreground">Your experience</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Please rate the following statements based on your experience during the session.
      </p>

      <div className="mt-6 space-y-6">
        <LikertRow
          label="1) I am satisfied with my results during the session."
          value={satisfaction}
          onChange={setSatisfaction}
          left="Strongly Disagree"
          right="Strongly Agree"
        />

        <LikertRow
          label="2) The tasks were clear and easy to understand."
          value={clarity}
          onChange={setClarity}
          left="Strongly Disagree"
          right="Strongly Agree"
        />

        <LikertRow
          label="3) The study required a lot of effort."
          value={effort}
          onChange={setEffort}
          left="Strongly Disagree"
          right="Strongly Agree"
        />

        <LikertRow
          label="4) I felt frustrated during the study."
          value={frustration}
          onChange={setFrustration}
          left="Strongly Disagree"
          right="Strongly Agree"
        />

        {/* Best workflow */}
        <div className="space-y-2">
          <div className="text-sm text-foreground">5) Which workflow felt most useful?</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Workflows.map((w) => {
              const active = bestWorkflow === w.key;
              return (
                <button
                  key={w.key}
                  type="button"
                  onClick={() => setBestWorkflow(w.key)}
                  aria-pressed={active}
                  className={[
                    "rounded-md border px-3 py-2 text-sm text-left transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-accent",
                  ].join(" ")}
                >
                  <span className="text-base">{w.icon}</span>
                  <span className="font-medium">{w.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reason */}
        <div
          className={[
            "rounded-lg border p-4",
            bestWorkflow
              ? "border-border bg-background"
              : "border-dashed border-border/60 bg-muted/40",
          ].join(" ")}
        >
          <label className="block text-sm text-foreground mb-2">
            {bestWorkflow
              ? `Why did "${Workflows.find(w => w.key === bestWorkflow)?.title}" work best for you?`
              : "Select a workflow above to explain your choice"}
          </label>

          <Textarea
            rows={2}
            maxLength={MAX_REASON_CHARS}
            disabled={!bestWorkflow}
            value={bestWorkflowReason}
            onChange={(e) =>
              setBestWorkflowReason(e.target.value.slice(0, MAX_REASON_CHARS))
            }
            placeholder={
              bestWorkflow
                ? "e.g. reduced effort, improved ideas, better control..."
                : "Choose a workflow first"
            }
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
            onChange={(e) =>
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
  );
}
