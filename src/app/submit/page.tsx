"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExperiment } from '@/stores/useExperiment';
import { useRouteGuard } from '@/lib/useRouteGuard';
import Progress from '@/components/ui/progress';
import { Button } from '@/components/shadcn_ui/button';
import { CheckCircle2, Timer as TimerIcon, ArrowRight, Trophy, Loader2, ClipboardList } from 'lucide-react';
import Header from "@/components/ui/header";

export default function AfterTrial() {
  useRouteGuard(['submit']);

  const { run, send } = useExperiment();
  const router = useRouter();

  const finishing = run.trialIndex >= run.totalTrials;
  const targetHref = finishing ? '/feedback' : '/choose';

  const [seconds, setSeconds] = useState(30);
  const [navigating, setNavigating] = useState(false);

  const [wordCount, setWordCount] = useState<number | null>(null);
  const [meetsRequiredWords, setMeetsRequiredWords] = useState<boolean | null>(null);
  const [meetsAvoidWords, setMeetsAvoidWords] = useState<boolean | null>(null);

  useEffect(() => {
    setWordCount(Number(localStorage.getItem("wordCount")));
    setMeetsRequiredWords(JSON.parse(localStorage.getItem("meetsRequiredWords") || "false"));
    setMeetsAvoidWords(JSON.parse(localStorage.getItem("meetsAvoidWords") || "false"));
  }, []);

  // Prefetch next page
  useEffect(() => {
    router.prefetch?.(targetHref);
  }, [router, targetHref]);

  const next = useCallback(() => {
    if (navigating) return;
    setNavigating(true);

    if (finishing) {
      send({ type: 'FINISH_SESSION' });
    } else {
      send({ type: 'NEXT_TRIAL' });
    }
    router.replace(targetHref);
  }, [finishing, targetHref, router, send, navigating]);

  // 30s auto-continue with visible countdown
  useEffect(() => {
    if (navigating) return;

    const interval = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    const timeout = setTimeout(() => next(), 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [next, navigating]);

  const title = useMemo(
    () => (finishing ? 'All trials submitted' : `Trial ${run.trialIndex} submitted`),
    [finishing, run.trialIndex]
  );

  const subtitle = useMemo(
    () =>
      finishing
        ? 'You’re done. Thanks for participating!'
        : `Next: Trial ${run.trialIndex + 1} of ${run.totalTrials}`,
    [finishing, run.trialIndex, run.totalTrials]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header workflow="" trial={0}/>
      <Progress />

      <div className="mx-auto max-w-3xl p-6">
        <section className="rounded-xl border bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>

              {/* Submission Summary */}
              <div className="mt-4 rounded-lg border bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ClipboardList className="h-4 w-4" />
                  Submission Summary (this trial)
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-700">Word Count:</span>
                    <span className="text-slate-600">{wordCount ?? '—'} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Required Words:</span>
                    <span className="text-slate-600">{meetsRequiredWords ? "✔️ Met" : "❌ Not Met"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Avoid Words:</span>
                    <span className="text-slate-600">{meetsAvoidWords ? "✔️ Met" : "❌ Not Met"}</span>
                  </div>
                </div>
              </div>

              {/* Countdown + CTA */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-1.5 text-xs text-slate-600">
                  <TimerIcon className="h-4 w-4" />
                  <span>
                    Continuing {finishing ? 'to feedback' : 'to next trial'} in{' '}
                    <span className="font-medium text-slate-800">{seconds}s</span>…
                  </span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <Button onClick={next} className="inline-flex items-center gap-2 bg-[var(--purple)]" disabled={navigating}>
                    {navigating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : finishing ? (
                      <Trophy className="h-4 w-4" />
                      ) : (
                      <ArrowRight className="h-4 w-4" />
                      )}
                    {finishing ? 'Go to feedback now' : 'Continue now'}
                  </Button>
                </div>
              </div>

              {!finishing && (
                <p className="mt-3 text-xs text-slate-500">
                  You’ll choose your workflow for the next trial on the next screen.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
