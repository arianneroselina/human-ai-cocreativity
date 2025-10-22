"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimerBadge } from "@/components/ui/timer";

function countWords(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

export default function HumanWorkPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);

  const readOnly = useMemo(() => locked, [locked]);
  const words = countWords(text);

  const clearDraft = () => setText("");

  const submit = () => {
    setLocked(true);
    console.log("[submitted]", { workflow: "human", length: text.length, words, text });
    alert("Submitted (stub). Check console for payload.");
  };

  const submitDisabled = locked || text.trim().length === 0;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-4xl p-4 flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/")} aria-label="Change workflow">
            ← Back
          </Button>
          <div className="mr-auto">
            <h1 className="text-xl font-semibold tracking-tight">Human–AI Co-Creativity</h1>
            <p className="text-xs text-gray-500">Workflow: <span className="font-medium text-gray-800">Human only</span></p>
          </div>
          <TimerBadge seconds={600} onDone={() => setLocked(true)} running={!locked} />
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-6">
        {/* Info */}
        <section className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">
            Write entirely by yourself. <span className="font-medium">No AI available.</span> Submit before time runs out.
          </p>
        </section>

        {/* Editor */}
        <section className="mt-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="draft" className="text-sm font-medium">Your draft</Label>
              <span className="text-xs text-gray-500">
                {words} words • {text.length} chars
              </span>
            </div>
            <Textarea
              id="draft"
              rows={14}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write here…"
              readOnly={readOnly}
              className={readOnly ? "bg-gray-100" : ""}
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-gray-500">
                {locked ? "Locked: time is up or already submitted." : "Editing enabled."}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={clearDraft}
                  disabled={locked || text.length === 0}
                >
                  Clear
                </Button>
                <Button onClick={submit} disabled={submitDisabled}>
                  Submit
                </Button>
              </div>
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
