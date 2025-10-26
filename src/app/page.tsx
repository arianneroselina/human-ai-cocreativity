"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExperiment } from '@/stores/useExperiment';
import { Button } from '@/components/shadcn_ui/button';
import { RotateCcw, Play, Loader2 } from 'lucide-react';
import Progress from '@/components/ui/progress';
import Rules from "@/components/ui/rules";

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
    send({ type: 'START_SESSION', totalTrials: 3 });
    router.replace('/choose');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Progress />
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Human–AI Co-Creativity
          </h1>
          <p className="mt-1 text-sm text-slate-600">Experimental study interface</p>
        </header>

        {/* Hero card */}
        <section className="rounded-xl border bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Start a new session
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Each session contains <span className="font-medium">3 trials</span>.
              </p>
            </div>
            <DevResetButton />
          </div>

          <Rules/>

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
      </div>
    </main>
  );
}
