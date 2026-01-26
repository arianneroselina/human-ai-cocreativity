"use client";

import { useMemo, useState } from "react";
import { useExperiment } from "@/stores/useExperiment";
import { Button } from "@/components/shadcn_ui/button";
import { CheckCircle2, Clipboard, ClipboardCheck, FileDown, ChevronDown } from "lucide-react";

export default function FinishSession() {
  const { run } = useExperiment();
  const [copied, setCopied] = useState(false);

  const sessionCode = useMemo(() => run.sessionId ?? "—", [run.sessionId]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const payload = {
      sessionId: run.sessionId,
      participantId: run.participantId,
      submittedAt: new Date().toISOString(),
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

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-6 w-6 text-green-600" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">
            Thank you for your feedback!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your responses have been recorded.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? "Copied" : "Copy session code"}
            </Button>

            <Button variant="secondary" onClick={handleDownload}>
              <FileDown className="h-4 w-4" />
              Download receipt
            </Button>
          </div>

          <details className="mt-6 group">
            <summary className="flex cursor-pointer items-center gap-2 text-sm">
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              Debrief & what happens next
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              This study examines Human-AI collaboration under time pressure.
              Some AI responses may have intentionally contained small mistakes to study trust dynamics.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
