"use client";

import { useMemo, useState } from "react";
import { useExperiment } from "@/stores/useExperiment";
import { Button } from "@/components/shadcn_ui/button";
import { CheckCircle2, Clipboard, ClipboardCheck, FileDown, ChevronDown } from "lucide-react";
import { useRouteGuard } from "@/lib/useRouteGuard";

export default function FinishPage() {
  useRouteGuard(["finish"]);

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
            Thank you for your participation!
          </h1>
          <p className="mt-3 mb-6 text-sm text-muted-foreground">
            This study examines Human-AI collaboration in creative writing tasks.
            Some AI responses may have intentionally contained small mistakes to study trust dynamics.
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
        </div>
      </div>
    </section>
  );
}
