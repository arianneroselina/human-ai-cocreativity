"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimerBadge } from "@/components/ui/timer";
import { ConfirmDialog } from "@/components/ui/confirm";

function countWords(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

export default function AIWorkPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  const [backOpen, setBackOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const readOnly = useMemo(() => true, []);
  const words = countWords(text);

  const generateAiDraft = () => {
    if (aiUsed) return;
    const draft = [
      "AI Draft — Outline",
      "1) Hook the reader with a compelling opener.",
      "2) Develop the main argument with 2–3 supporting points.",
      "3) End with a crisp, memorable conclusion.",
      "",
      "Tip: Keep sentences active and specific.",
    ].join("\n");
    setText(draft);
    setAiUsed(true);
  };

  const submit = () => {
    if (!aiUsed) return;
    setLocked(true);
    console.log("[submitted]", { workflow: "ai", length: text.length, words, text });
    alert("Submitted (stub). Check console for payload.");
  };

  const submitDisabled = locked || !aiUsed || text.trim().length === 0;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-4xl p-4 flex items-center gap-3">
          <Button variant="ghost" onClick={() => setBackOpen(true)} aria-label="Change workflow">
            ← Back
          </Button>

          <ConfirmDialog
            open={backOpen}
            onOpenChange={setBackOpen}
            title="Leave this session?"
            description="Your current draft won't be saved (prototype). Go back to the workflow selection?"
            confirmLabel="Go back"
            cancelLabel="Stay here"
            onConfirm={() => router.push("/")}
          />

          <div className="mr-auto">
            <h1 className="text-xl font-semibold tracking-tight">Human–AI Co-Creativity</h1>
            <p className="text-xs text-gray-500">Workflow: <span className="font-medium text-gray-800">AI only</span></p>
          </div>
          <TimerBadge seconds={600} onDone={() => setLocked(true)} running={!locked} />
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-6">
        {/* Info */}
        <section className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">
            Generate a single AI draft and <span className="font-medium">submit without editing</span>.
          </p>
        </section>

        {/* Actions */}
        <section className="mt-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm flex items-center gap-2">
            <Button onClick={generateAiDraft} disabled={locked || aiUsed}>
              {aiUsed ? "AI Draft Generated" : "Generate AI Draft"}
            </Button>
            <span className="ml-auto text-sm text-gray-500">
              {aiUsed ? "Review the AI draft and submit." : "Generate the AI draft to proceed."}
            </span>
          </div>
        </section>

        {/* Editor (read-only) */}
        <section className="mt-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="draft" className="text-sm font-medium">AI draft (read-only)</Label>
              <span className="text-xs text-gray-500">
                {words} words • {text.length} chars
              </span>
            </div>
            <Textarea
              id="draft"
              rows={14}
              value={text}
              onChange={() => {}}
              placeholder="Click 'Generate AI Draft' to see the output…"
              readOnly={readOnly}
              className="bg-gray-100"
            />

            <div className="mt-3 flex items-center justify-end gap-2">
              <Button onClick={() => setSubmitOpen(true)} disabled={submitDisabled}>
                Submit
              </Button>

              <ConfirmDialog
                open={submitOpen}
                onOpenChange={setSubmitOpen}
                title="Submit your draft?"
                description="You won't be able to edit after submitting."
                confirmLabel="Submit"
                cancelLabel="Cancel"
                onConfirm={() => {
                  setLocked(true);
                  console.log("[submitted]", { workflow: "human", length: text.length, text });
                  alert("Submitted (stub). Check console for payload.");
                }}
              />
            </div>
          </div>
        </section>

        <footer className="mt-6 text-center text-xs text-gray-400">
          Prototype UI — no data is saved yet.
        </footer>
      </div>
    </main>
  );
}
