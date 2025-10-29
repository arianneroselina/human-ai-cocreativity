"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { useExperiment } from "@/stores/useExperiment";
import { CheckCircle2, Clipboard, ClipboardCheck, FileDown, RefreshCw, ChevronDown } from "lucide-react";
import { Workflow, Workflows } from "@/lib/experiment";
import LikertRow, { Likert } from "@/components/ui/likertRow";
import Header from "@/components/ui/header";
import Progress from "@/components/ui/progress";

export default function FeedbackPage() {
  useRouteGuard(["feedback"]);

  const router = useRouter();
  const { run, send } = useExperiment();

  const [satisfaction, setSatisfaction] = useState<Likert | null>(null);
  const [clarity, setClarity] = useState<Likert | null>(null);
  const [recommendation, setRecommendation] = useState<Likert | null>(null);
  const [workflowBest, setWorkflowBest] = useState<Workflow | null>(null);
  const [comment, setComment] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const canSubmit =
    satisfaction !== null &&
    clarity !== null &&
    recommendation !== null &&
    workflowBest !== null;

  const sessionCode = useMemo(() => run.sessionId ?? "—", [run.sessionId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleDownload = () => {
    const payload = {
      sessionId: run.sessionId,
      participantId: run.participantId,
      totalTrials: run.totalTrials,
      submittedAt: new Date().toISOString(),
      feedback: {
        satisfaction,
        clarity,
        recommendation,
        workflowBest,
        comments: comment || null,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-receipt-${run.sessionId ?? "session"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    const { run } = useExperiment.getState();
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: run.sessionId,
        satisfaction,
        clarity,
        recommendation,
        workflowBest,
        comment,
      }),
    });

    console.log("Survey submitted:", {
      sessionId: run.sessionId,
      satisfaction,
      clarity,
      recommendation,
      workflowBest,
      comment,
    });
  };

  const startNew = () => {
    // Clear store & persisted state, then go home
    (useExperiment as any).persist?.clearStorage?.();
    send({ type: "RESET" });
    router.replace("/");
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <Header workflow="" trial={0}/>

        <div className="mx-auto max-w-3xl p-6">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Thank you for your feedback!
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Your responses were recorded. Below are a few options for your records.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2"
                    title="Copy anonymous session code"
                  >
                    {copied ? (
                      <>
                        <ClipboardCheck className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-4 w-4" />
                        Copy session code
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2"
                    title="Download a JSON receipt"
                  >
                    <FileDown className="h-4 w-4" />
                    Download receipt
                  </Button>
                  <Button
                    onClick={startNew}
                    className="inline-flex items-center gap-2 bg-[var(--purple)]"
                    title="Start a new session"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Start new session
                  </Button>
                </div>

                <details className="mt-6 group">
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-gray-700 hover:underline">
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    Debrief & what happens next
                  </summary>
                  <div className="mt-3 text-sm text-gray-700">
                    <p>
                      We’re studying how people collaborate with AI under time limits and how this affects
                      efficiency, quality, and trust. In some conditions, AI responses may intentionally include minor
                      mistakes to study trust dynamics.
                    </p>
                    <p className="mt-2">
                      If you have questions or want to withdraw your data, contact the study team with your session code:
                      <span className="ml-1 font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{sessionCode}</span>.
                    </p>
                  </div>
                </details>

                <p className="mt-6 text-xs text-gray-400">
                  ❤ Thanks again for helping research in Human-AI Co-Creativity.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold">Final feedback</h1>
          <p className="text-sm text-gray-600 mt-1">
            Thanks for completing all {run.totalTrials} trials. A few short questions:
          </p>
        </header>

        {/* Feedback form */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-xl text-gray-800">Your experience</h2>
          <p className="text-sm text-gray-600 mt-2">
            Please rate and tell us which workflow worked best for you.
          </p>

          <div className="mt-6 space-y-6">
            <LikertRow
              label="1) Overall satisfaction"
              value={satisfaction}
              onChange={setSatisfaction}
              left="Very dissatisfied"
              right="Very satisfied"
            />

            <LikertRow
              label="2) Task clarity"
              value={clarity}
              onChange={setClarity}
              left="Very unclear"
              right="Very clear"
            />

            <LikertRow
              label="3) Likely to recommend similar tasks"
              value={recommendation}
              onChange={setRecommendation}
              left="Very unlikely"
              right="Very likely"
            />

            {/* Workflow picker */}
            <div className="space-y-2">
              <div className="text-sm text-gray-700">4) Which workflow felt most useful?</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Workflows.map((w) => {
                  const active = workflowBest === w.key;
                  return (
                    <button
                      key={w.key}
                      type="button"
                      onClick={() => setWorkflowBest(w.key)}
                      aria-pressed={active}
                      className={[
                        "rounded-md border px-3 py-2 text-sm text-left",
                        active
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <div className="font-medium">{w.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <label htmlFor="comment" className="block text-sm text-gray-700">
                Additional comments (optional)
              </label>
              <input
                id="comment"
                type="text"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm"
                placeholder="Anything that stood out, suggestions, etc."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button onClick={handleSubmit} disabled={!canSubmit} className="bg-[var(--purple)]">
              Submit feedback
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
