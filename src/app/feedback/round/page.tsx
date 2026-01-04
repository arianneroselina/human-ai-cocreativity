"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { Button } from "@/components/shadcn_ui/button";
import Progress from "@/components/ui/progress";
import LikertRow, { Likert } from "@/components/ui/likertRow";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Workflows, type Workflow } from "@/lib/experiment";
import { Textarea } from "@/components/shadcn_ui/textarea";

export default function RoundFeedbackPage() {
  useRouteGuard(["round_feedback"]);

  const router = useRouter();
  const { run, send } = useExperiment();
  const [loading, setLoading] = useState(false);

  const workflowKey = run.workflow as Workflow;
  const wf = Workflows.find((w) => w.key === workflowKey);
  const workflowUsesAI =
    workflowKey === "ai" || workflowKey === "human_ai" || workflowKey === "ai_human";

  const [liking, setLiking] = useState<Likert | null>(null);
  const [trust, setTrust] = useState<Likert | null>(null); // AI only
  const [satisfaction, setSatisfaction] = useState<Likert | null>(null);
  const [mentalDemand, setMentalDemand] = useState<Likert | null>(null);
  const [physicalDemand, setPhysicalDemand] = useState<Likert | null>(null);
  const [temporalDemand, setTemporalDemand] = useState<Likert | null>(null);
  const [effort, setEffort] = useState<Likert | null>(null);
  const [frustration, setFrustration] = useState<Likert | null>(null);
  const [comment, setComment] = useState("");
  const commentChars = useMemo(() => comment.length, [comment]);
  const MAX_COMMENT_CHARS = 200;

  const canSubmit =
    liking !== null &&
    satisfaction !== null &&
    (workflowUsesAI ? trust !== null : true) &&
    mentalDemand !== null &&
    physicalDemand !== null &&
    temporalDemand !== null &&
    effort !== null &&
    frustration !== null;

  const title = useMemo(
    () => `Round ${run.roundIndex} — quick feedback`,
    [run.roundIndex]
  );

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
        liking,
        trust,
        satisfaction,
        mentalDemand,
        physicalDemand,
        temporalDemand,
        effort,
        frustration,
        comment,
      }),
    });

    console.log("Round Feedback submitted:", {
      sessionId: run.sessionId,
      roundIndex: run.roundIndex,
      workflow: run.workflow,
      liking,
      trust,
      satisfaction,
      mentalDemand,
      physicalDemand,
      temporalDemand,
      effort,
      frustration,
      comment,
    });

    if (run.roundIndex >= run.totalRounds) {
      send({ type: "FINISH_SESSION" });
      router.replace("/feedback/session");
    } else {
      send({ type: "NEXT_ROUND" });
      router.replace("/choose");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-dvh bg-background">
      <Progress />

      <div className="mx-auto max-w-3xl p-6">
        <section className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {(run.roundIndex >= run.totalRounds) ?
                  "Just a few quick questions before finishing the session." :
                  "Just a few quick questions before the next round."
                }
              </p>

              {wf && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
                  <span className="text-base leading-none">{wf.icon}</span>
                  <span className="font-medium">{wf.title}</span>
                </div>
              )}

              <div className="mt-5 space-y-5">
                <LikertRow
                  label={`1) I liked the workflow "${wf?.title}" I chose this round.`}
                  value={liking}
                  onChange={setLiking}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />

                {workflowUsesAI && (
                  <LikertRow
                    label="2) I trusted the AI during this round."
                    value={trust}
                    onChange={setTrust}
                    left="Strongly Disagree"
                    right="Strongly Agree"
                  />
                )}

                <LikertRow
                  label={`${workflowUsesAI ? "3" : "2"}) I am satisfied with the results of this round.`}
                  value={satisfaction}
                  onChange={setSatisfaction}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />

                {/* Start of TLX metrics */}
                <LikertRow
                  label={`${workflowUsesAI ? "4" : "3"}) This task was mentally demanding.`}
                  value={mentalDemand}
                  onChange={setMentalDemand}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />
                <LikertRow
                  label={`${workflowUsesAI ? "5" : "4"}) This task was physically demanding.`}
                  value={physicalDemand}
                  onChange={setPhysicalDemand}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />
                <LikertRow
                  label={`${workflowUsesAI ? "6" : "5"}) I felt rushed during this round.`}
                  value={temporalDemand}
                  onChange={setTemporalDemand}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />
                <LikertRow
                  label={`${workflowUsesAI ? "7" : "6"}) This task required a lot of effort.`}
                  value={effort}
                  onChange={setEffort}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />
                <LikertRow
                  label={`${workflowUsesAI ? "8" : "7"}) I felt frustrated during this round.`}
                  value={frustration}
                  onChange={setFrustration}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />

                <div className="space-y-2">
                  <label htmlFor="comment" className="block text-sm text-foreground">
                    Optional short comment
                  </label>

                  <Textarea
                    id="comment"
                    rows={2}
                    maxLength={MAX_COMMENT_CHARS}
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_CHARS))}
                    placeholder="Anything notable this round?"
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />

                  <div className="flex justify-end">
                    <span
                      className={`text-xs ${commentChars >= MAX_COMMENT_CHARS ? "text-red-500" : "text-muted-foreground"}`}
                      aria-live="polite"
                      role="status"
                    >
                      {commentChars}/{MAX_COMMENT_CHARS}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                  className="inline-flex items-center gap-2"
                >
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
