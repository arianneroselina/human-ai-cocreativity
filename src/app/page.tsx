"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/stores/useExperiment";
import { Button } from "@/components/shadcn_ui/button";
import { Workflows } from "@/lib/experiment";
import {
  RotateCcw,
  Play,
  Loader2,
  ArrowLeftRight,
  Users,
  Timer as TimerIcon,
  Clock,
  ClipboardList,
  EyeOff,
} from "lucide-react";

function DevResetButton() {
  const { send } = useExperiment();

  const resetAll = () => {
    (useExperiment as any).persist?.clearStorage?.();
    send({ type: "RESET" });
    alert("Resetted.");
  };

  return (
    <button
      onClick={resetAll}
      className="inline-flex items-center gap-2 text-xs rounded-md border border-border bg-secondary px-2.5 py-1
      text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title="Reset experiment state (dev only)"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      Reset
    </button>
  );
}

export default function Page() {
  const router = useRouter();
  const { run, send } = useExperiment();
  const [starting, setStarting] = useState<boolean>(false);

  useEffect(() => {
    router.prefetch?.("/id");
  }, [router]);

  const hasActiveSession = useMemo(
    () => run.phase !== "idle" && run.phase !== "finish",
    [run.phase]
  );

  const resumeTarget = useMemo(() => {
    if (starting) return null;
    switch (run.phase) {
      case "id":
        return "/id";
      case "tutorial":
        return "/tutorial";
      case "practice":
        return "/practice";
      case "practice_complete":
        return "/practice/complete";
      case "choose_workflow":
        return "/choose";
      case "task":
        return `/task/${run.workflow}`;
      case "round_feedback":
        return "/feedback/round";
      case "feedback":
        return "/feedback/session";
      default:
        return null;
    }
  }, [run.phase, run.workflow, starting]);

  const start = async () => {
    if (hasActiveSession || starting) return;

    try {
      setStarting(true);

      send({ type: "START_SESSION" });
      const { run } = useExperiment.getState();

      await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: run.sessionId,
          totalRounds: run.totalRounds,
          totalPracticeRounds: run.totalPracticeRounds,
        }),
      });

      router.replace("/id");
    } finally {
      setStarting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        {/* Hero / Start card */}
        <section className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Start a new session
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This session includes{" "}
                <span className="font-medium text-foreground">4 practice rounds</span>{" "}
                (to experience all workflows) and{" "}
                <span className="font-medium text-foreground">3 main rounds</span>.
              </p>
            </div>
            <DevResetButton />
          </div>

          {/* CTA row */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {resumeTarget && (
              <Button
                variant="secondary"
                onClick={() => router.replace(resumeTarget)}
                className="inline-flex items-center gap-2"
                title="Resume where you left off"
              >
                <Play className="h-4 w-4" />
                Resume
              </Button>
            )}

            <Button
              onClick={start}
              disabled={hasActiveSession || starting}
              className="inline-flex items-center gap-2 bg-primary"
            >
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start session
            </Button>

            {hasActiveSession && (
              <span className="ml-1 text-xs text-muted-foreground">
                Session in progress — please <span className="font-medium text-foreground">Resume</span>.
              </span>
            )}

            {!hasActiveSession && (
              <div className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs text-foreground">This whole session takes ~30-50 minutes</span>
              </div>
            )}
          </div>
        </section>

        {/* About the study */}
        <section className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Users className="h-6 w-6 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold tracking-tight">About the study</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                In this study, you’ll complete short, time-boxed creative writing tasks under different
                <span className="font-medium text-foreground"> human-AI collaboration workflows</span>.
                We compare how workflows influence <span className="font-medium text-foreground">efficiency</span>,{" "}
                <span className="font-medium text-foreground">output quality</span>,{" "}
                <span className="font-medium text-foreground">workflow choices</span>, and{" "}
                <span className="font-medium text-foreground">trust in AI</span>.
              </p>
            </div>
          </div>

            {/* Workflows */}
            <div className="mt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ArrowLeftRight className="h-4 w-4" />
                The 4 workflow types
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Workflows.map((w) => (
                  <div key={w.key} className="rounded-lg border border-border bg-card p-3 text-sm">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <span className="text-base">{w.icon}</span>
                      <span>{w.title}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Structure */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <TimerIcon className="h-4 w-4" />
                  Session structure
                </div>

                <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal pl-5">
                  <li>
                    <span className="font-medium text-foreground">Practice (4 rounds):</span> you experience each workflow once
                    (random order).
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Main (3 rounds):</span> before each round, you choose which
                    workflow you want to use.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Feedback:</span> a short questionnaire follows every round,
                    plus a brief session wrap-up at the end.
                  </li>
                </ol>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ClipboardList className="h-4 w-4" />
                  What you’ll do each round
                </div>

                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>
                    Read a short prompt and complete a <span className="font-medium text-foreground">timed writing task</span>.
                  </li>
                  <li>
                    Depending on the workflow, you may write alone, use AI, or edit after AI/human.
                  </li>
                  <li>
                    Submit your final text and answer a few quick questions.
                  </li>
                </ul>
              </div>
            </div>

            {/* Data + ethics */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ClipboardList className="h-4 w-4" />
                  What we record (pseudonymized)
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Timing and duration per round.</li>
                  <li>Workflow used in each round.</li>
                  <li>Your final text output.</li>
                  <li>Round feedback and session feedback.</li>
                  <li>AI chat messages and actions (when applicable).</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <EyeOff className="h-4 w-4" />
                  Privacy
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>No names or contact details are collected.</li>
                  <li>Participation is voluntary. You can stop at any time.</li>
                  <li>We collect basic background information (e.g., age, language level) for analysis.</li>
                  <li>Data is handled in line with GDPR principles.</li>
                </ul>
              </div>
            </div>
        </section>
      </div>
    </main>
  );
}
