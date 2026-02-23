"use client";

import { useState, useMemo } from "react";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { Button } from "@/components/shadcn_ui/button";
import Progress from "@/components/ui/layout/progress";
import LikertRow, { Likert } from "@/components/ui/feedback/likertRow";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Workflows, type Workflow, usesAI, isPracticeMode } from "@/lib/experiment";
import { Textarea } from "@/components/shadcn_ui/textarea";
import { TlxRow } from "@/components/ui/feedback/tlxRow";

export default function RoundFeedbackPage() {
  useRouteGuard(["round_feedback"]);

  const { run, send } = useExperiment();
  const [loading, setLoading] = useState(false);

  const workflowKey = run.workflow as Workflow;
  const wf = Workflows.find((w) => w.key === workflowKey);
  const workflowUsesAI = usesAI(workflowKey);

  /* ---------- NASA TLX (21-point) ---------- */
  const [mentalDemand, setMentalDemand] = useState<number | null>(null);
  const [physicalDemand, setPhysicalDemand] = useState<number | null>(null);
  const [temporalDemand, setTemporalDemand] = useState<number | null>(null);
  const [performance, setPerformance] = useState<number | null>(null);
  const [effort, setEffort] = useState<number | null>(null);
  const [frustration, setFrustration] = useState<number | null>(null);

  /* ---------- AI collaboration & understanding ---------- */
  const [aiUnderstanding, setAiUnderstanding] = useState<Likert | null>(null);
  const [aiCollaboration, setAiCollaboration] = useState<Likert | null>(null);
  const [aiCreativitySupport, setAiCreativitySupport] = useState<Likert | null>(null);
  const [aiPerformanceOverall, setAiPerformanceOverall] = useState<Likert | null>(null);

  /* ---------- Satisfaction & confidence ---------- */
  const [rulesConfidence, setRulesConfidence] = useState<Likert | null>(null);
  const [satisfactionResult, setSatisfactionResult] = useState<Likert | null>(null);

  /* ---------- Optional comment ---------- */
  const [comment, setComment] = useState("");
  const MAX_COMMENT_CHARS = 200;

  const canSubmit =
    mentalDemand !== null &&
    physicalDemand !== null &&
    temporalDemand !== null &&
    performance !== null &&
    effort !== null &&
    frustration !== null &&
    (!workflowUsesAI ||
      (aiUnderstanding && aiCollaboration && aiCreativitySupport && aiPerformanceOverall)) &&
    rulesConfidence !== null &&
    satisfactionResult !== null;

  const title = useMemo(() => {
    let index = run.roundIndex;
    if (isPracticeMode(run.mode)) {
      return `Practice ${index} — feedback`;
    }
    index = run.roundIndex - run.totalPracticeRounds;
    return `Round ${index} — feedback`;
  }, [run]);

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);

    const { run } = useExperiment.getState();

    await fetch("/api/feedback/round", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: run.sessionId,
        roundIndex: run.roundIndex,
        workflow: run.workflow,
        taskId: run.taskId,

        mentalDemand,
        physicalDemand,
        temporalDemand,
        performance,
        effort,
        frustration,

        aiUnderstanding,
        aiCollaboration,
        aiCreativitySupport,
        aiPerformanceOverall,

        rulesConfidence,
        satisfactionResult,

        comment,
      }),
    });

    if (run.roundIndex >= run.totalRounds + run.totalPracticeRounds) {
      send({ type: "START_FINAL_FEEDBACK" });
    } else {
      send({ type: "NEXT_ROUND" });
    }

    setLoading(false);
  };

  return (
    <main className="bg-background">
      <Progress />

      <div className="mx-auto max-w-3xl p-6">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex gap-4">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 mt-1" />

            <div className="flex-1 space-y-8">
              <div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Just a few questions before continuing.
                </p>

                {wf && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-md border bg-muted px-2.5 py-1.5 text-xs">
                    <span>{wf.icon}</span>
                    <span className="font-medium">{wf.title}</span>
                  </div>
                )}
              </div>

              {/* NASA TLX */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Workload (NASA-TLX)
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Please indicate your perceived workload during this round.
                  </p>
                </div>

                <div className="space-y-6">
                  <TlxRow
                    title="Mental Demand"
                    question="How mentally demanding was the task?"
                    value={mentalDemand}
                    onChange={setMentalDemand}
                    left="Very Low"
                    right="Very High"
                  />

                  <TlxRow
                    title="Physical Demand"
                    question="How physically demanding was the task?"
                    value={physicalDemand}
                    onChange={setPhysicalDemand}
                    left="Very Low"
                    right="Very High"
                  />

                  <TlxRow
                    title="Temporal Demand"
                    question="How hurried or rushed was the pace of the task?"
                    value={temporalDemand}
                    onChange={setTemporalDemand}
                    left="Very Low"
                    right="Very High"
                  />

                  <TlxRow
                    title="Performance"
                    question="How successful were you in accomplishing what you were asked to do?"
                    value={performance}
                    onChange={setPerformance}
                    left="Perfect"
                    right="Failure"
                  />

                  <TlxRow
                    title="Effort"
                    question="How hard did you have to work to accomplish your level of performance?"
                    value={effort}
                    onChange={setEffort}
                    left="Very Low"
                    right="Very High"
                  />

                  <TlxRow
                    title="Frustration"
                    question="How insecure, discouraged, irritated, stressed, and annoyed were you?"
                    value={frustration}
                    onChange={setFrustration}
                    left="Very Low"
                    right="Very High"
                  />
                </div>
              </div>

              <hr className="border-border" />

              {/* AI collaboration */}
              {workflowUsesAI && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    AI collaboration
                  </h3>

                  <LikertRow
                    label="It was easy to understand what the AI does and what I am supposed to do"
                    value={aiUnderstanding}
                    onChange={setAiUnderstanding}
                    left="Strongly Disagree"
                    right="Strongly Agree"
                  />

                  <LikertRow
                    label="The AI collaborated well with me"
                    value={aiCollaboration}
                    onChange={setAiCollaboration}
                    left="Strongly Disagree"
                    right="Strongly Agree"
                  />

                  <LikertRow
                    label="The AI helped me become more creative"
                    value={aiCreativitySupport}
                    onChange={setAiCreativitySupport}
                    left="Strongly Disagree"
                    right="Strongly Agree"
                  />

                  <LikertRow
                    label="Overall, the AI’s performance was high"
                    value={aiPerformanceOverall}
                    onChange={setAiPerformanceOverall}
                    left="Strongly Disagree"
                    right="Strongly Agree"
                  />
                </div>
              )}

              <hr className="border-border" />

              {/* Satisfaction */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Satisfaction & confidence
                </h3>

                <LikertRow
                  label="I am confident that I followed the task instructions correctly."
                  value={rulesConfidence}
                  onChange={setRulesConfidence}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />

                <LikertRow
                  label="I am satisfied with the final result of this round."
                  value={satisfactionResult}
                  onChange={setSatisfactionResult}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />
              </div>

              <hr className="border-border" />

              <div className="space-y-2">
                <label className="text-sm font-medium">Optional short comment</label>
                <Textarea
                  rows={2}
                  maxLength={MAX_COMMENT_CHARS}
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_CHARS))}
                />
                <div className="flex justify-end text-xs text-muted-foreground">
                  {comment.length} / {MAX_COMMENT_CHARS}
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
