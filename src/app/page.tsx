"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/stores/useExperiment";
import { Button } from "@/components/shadcn_ui/button";
import Rules from "@/components/ui/rules";
import { Workflows } from "@/lib/experiment";
import {
  RotateCcw,
  Play,
  Loader2,
  ArrowLeftRight,
  Users,
  Timer as TimerIcon,
  ShieldCheck,
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
  const [detailsOpen, setDetailsOpen] = useState(true);

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

          <Rules />

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
              <h3 className="text-xl font-semibold tracking-tight">What this study is about</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We&#39;re exploring how people collaborate with AI on time-boxed creative writing tasks, and how this affects
                <span className="font-medium text-foreground"> efficiency</span>,{" "}
                <span className="font-medium text-foreground">output quality</span>,{" "}
                <span className="font-medium text-foreground">workflow choices</span>, and{" "}
                <span className="font-medium text-foreground">trust in AI</span>.
                You&#39;ll first do a short practice section, then continue with the main rounds.
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={() => setDetailsOpen(!detailsOpen)}
              aria-label={detailsOpen ? "Hide Task Details" : "Show Task Details"}
              className="text-muted-foreground"
            >
              {detailsOpen ? "▲" : "▼"}
            </Button>
          </div>

          {detailsOpen && (
            <>
              {/* Workflows */}
              <div className="mt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ArrowLeftRight className="h-4 w-4" />
                  Collaboration workflows
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

              {/* What to expect */}
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <TimerIcon className="h-4 w-4" />
                    What to expect
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <span className="font-medium text-foreground">Practice:</span> 4 rounds (all workflows once, random order).
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Main:</span> 3 rounds (you choose a workflow each round).
                    </li>
                    <li>Each round: complete a timed creative writing task.</li>
                    <li>Short feedback at the end of each round.</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ClipboardList className="h-4 w-4" />
                    What we record (pseudonymized)
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Task duration and timing.</li>
                    <li>Workflow used in each round.</li>
                    <li>The final text output.</li>
                    <li>Feedback.</li>
                    <li>AI chat messages and actions.</li>
                  </ul>
                </div>
              </div>

              {/* Ethics & Privacy */}
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    Ethics & fairness
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Participation is voluntary.</li>
                    <li>You can stop at any time.</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <EyeOff className="h-4 w-4" />
                    Privacy
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>No names or contact details are collected.</li>
                    <li>We collect background information (e.g., age, gender, language) for research analysis.</li>
                    <li>Data is handled in line with GDPR principles.</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
