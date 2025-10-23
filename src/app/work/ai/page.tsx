"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm";
import TaskDetails from "@/components/ui/taskDetails";
import Header from "@/components/ui/header";

function countWords(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

export default function AIWorkPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
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
    setLocked(true);
    console.log("[submitted]", { workflow: "human", length: text.length, text });
    alert("Submitted (stub). Check console for payload.");
    router.push("/result");
  };

  const submitDisabled = locked || !aiUsed || text.trim().length === 0;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <Header workflow="AI only"/>

      <div className="mx-auto max-w-4xl p-6">
        {/* Info */}
        <TaskDetails/>

        {/* Actions */}
        <section className="mt-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm items-center">
            <p className="text-sm text-gray-600">
              Generate a single AI draft and <span className="font-medium">submit without editing</span>.
            </p>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={generateAiDraft} disabled={locked || aiUsed}>
                {aiUsed ? "AI Draft Generated" : "Generate AI Draft"}
              </Button>
              <span className="ml-auto text-sm text-gray-500">
                {aiUsed ? "Review the AI draft and submit." : "Generate the AI draft to proceed."}
              </span>
            </div>
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
                onConfirm={submit}
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
