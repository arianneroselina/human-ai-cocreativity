"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExperiment } from '@/stores/useExperiment';
import { Button } from '@/components/shadcn_ui/button';
import Progress from '@/components/ui/progress';
import Rules from "@/components/ui/rules";
import { Workflows } from "@/lib/experiment";
import {
  RotateCcw, Play, Loader2, ArrowLeftRight, Users, Timer as TimerIcon, ClipboardList, ShieldCheck, EyeOff,
} from 'lucide-react';

function DevResetButton() {
  const { send } = useExperiment();
  const router = useRouter();

  const resetAll = () => {
    (useExperiment as any).persist?.clearStorage?.();
    router.replace('/');
    send({ type: 'RESET' });
  };

  return (
    <button
      onClick={resetAll}
      className="inline-flex items-center gap-2 text-xs rounded border px-2.5 py-1 hover:bg-gray-50"
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
  const [starting, setStarting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  // Prefetch choose page to reduce visual delay
  useEffect(() => {
    router.prefetch?.('/choose');
  }, [router]);

  // Active session means user must Resume
  const hasActiveSession = useMemo(
    () => run.phase !== 'idle' && run.phase !== 'feedback',
    [run.phase]
  );

  const resumeTarget = useMemo(() => {
    if (starting) return null; // avoid flicker just after clicking Start
    switch (run.phase) {
      case 'choose_workflow': return '/choose';
      case 'task':            return `/task/${run.workflow}`;
      case 'submit':          return '/submit';
      case 'feedback':        return '/feedback';
      default:                return null;
    }
  }, [run.phase, run.workflow, starting]);

  const start = () => {
    setStarting(true);
    send({ type: 'START_SESSION', totalTrials: 3 }); // fixed to 3 (pilot)
    router.replace('/choose');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Progress />

      <div className="mx-auto max-w-5xl p-6 space-y-6">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Human–AI Co-Creativity
          </h1>
          <p className="mt-1 text-sm text-slate-600">Experimental study interface</p>
        </header>

        {/* Hero / Start card */}
        <section className="rounded-xl border bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Start a new session
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                This pilot session contains <span className="font-medium">3 short trials</span>. You can pause during a task, but each trial is time-boxed.
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
              className="inline-flex items-center gap-2"
              title={hasActiveSession ? "Session in progress — Resume instead" : "Start session"}
            >
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start session
            </Button>

            {hasActiveSession && (
              <span className="ml-1 text-xs text-slate-500">
                Session in progress — please <span className="font-medium">Resume</span>.
              </span>
            )}
          </div>
        </section>

        {/* About the study */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Users className="h-6 w-6 text-slate-800 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold tracking-tight">What this study is about</h3>
              <p className="mt-2 text-sm text-slate-700">
                We’re exploring how people collaborate with AI on time-boxed tasks, and how this affects <span className="font-medium">efficiency, output quality, workflow choices,</span> and <span className="font-medium">trust in AI</span>.
                You’ll complete multiple short tasks while choosing one of four collaboration workflows each round.
                Your outputs are later stored anonymously and we&apos;ll analyze how choices and performance evolve over time.
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={() => setDetailsOpen(!detailsOpen)}
              aria-label={detailsOpen ? "Hide Task Details" : "Show Task Details"}
              className="text-gray-500"
            >
              {detailsOpen ? "▲" : "▼"}
            </Button>

          </div>

          {/* Workflows */}
          {detailsOpen && (
            <>
              <div className="mt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ArrowLeftRight className="h-4 w-4" />
                  Collaboration workflows (choose one each round)
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Workflows.map((w) => (
                    <div key={w.key} className="rounded-lg border bg-white p-3 text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-base">{w.icon}</span>
                        <span>{w.title}</span>
                      </div>
                      <p className="mt-1 text-slate-700">{w.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What happens each round */}
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <TimerIcon className="h-4 w-4" />
                    What to expect in this session
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>3 time-boxed trials. In each trial you’ll <span className="font-medium">choose a workflow</span>, then complete the task.</li>
                    <li>At the very end, you’ll answer a brief feedback survey.</li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <ClipboardList className="h-4 w-4" />
                    What we record (anonymously)
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>Task duration and timing.</li>
                    <li>Your selected workflow each round.</li>
                    <li>Human ↔ AI interaction logs (when/if AI is used).</li>
                    <li>The final text output.</li>
                  </ul>
                </div>
              </div>

              {/* Ethics & Privacy */}
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <ShieldCheck className="h-4 w-4" />
                    Ethics & fairness
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>Participation is voluntary.</li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <EyeOff className="h-4 w-4" />
                    Privacy & anonymization
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>No personal data is collected; we follow GDPR-compliant handling of study data.</li>
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
