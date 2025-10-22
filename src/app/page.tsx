"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TimerBadge } from "@/components/ui/timer";

type Workflow = "human" | "ai" | "human_ai" | "ai_human";

export default function Home() {
  const [workflow, setWorkflow] = useState<Workflow>("human");
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  // --- Edit rules ---
  // - AI-only: always read-only (no typing). Submit after AI draft appears.
  // - AI→Human: read-only until AI draft is generated, then editable.
  // - Human→AI: editable from start; AI button optional.
  const readOnly = useMemo(() => {
    if (locked) return true;
    if (workflow === "ai") return true;                       // <- hard lock for AI-only mode
    if (workflow === "ai_human" && !aiUsed) return true;      // start from AI, then edit
    return false;
  }, [workflow, aiUsed, locked]);

  const generateAiDraft = () => {
    if (workflow === "ai" && aiUsed) return; // one-shot in AI-only
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

  const clearDraft = () => setText("");

  const submit = () => {
    setLocked(true);
    console.log("[submitted]", { workflow, length: text.length, text });
    alert("Submitted (stub). Check console for payload.");
  };

  const canGenerate =
    (workflow === "ai" || workflow === "ai_human" || workflow === "human_ai") &&
    !(workflow === "ai" && aiUsed); // disable regenerate in AI-only

  const submitDisabled =
    locked ||
    text.trim().length === 0 ||
    (workflow === "ai" && !aiUsed); // in AI-only, must generate first

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Human–AI Co-Creativity
            </h1>
            <p className="text-sm text-gray-500">
              Choose a workflow, write your draft, and submit before time runs out.
            </p>
          </div>
          <TimerBadge seconds={600} onDone={() => setLocked(true)} running={!locked} />
        </header>

        {/* Workflow Tabs */}
        <section className="mt-6">
          <Tabs
            defaultValue="human"
            value={workflow}
            onValueChange={(v) => {
              setWorkflow(v as Workflow);
              // reset AI state for clarity when switching modes
              setAiUsed(false);
              if (v === "ai") setText(""); // clear when entering AI-only
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="human">Human</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="human_ai">Human→AI</TabsTrigger>
              <TabsTrigger value="ai_human">AI→Human</TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <TabsContent value="human">
                <p>Write entirely by yourself. No AI assistance.</p>
              </TabsContent>
              <TabsContent value="ai">
                <p>AI-only: Generate a single AI draft and submit. Editing is disabled.</p>
              </TabsContent>
              <TabsContent value="human_ai">
                <p>Begin writing yourself, then optionally request AI help.</p>
              </TabsContent>
              <TabsContent value="ai_human">
                <p>Get an AI draft first, then refine it yourself.</p>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        {/* Action Bar */}
        <section className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            {canGenerate && (
              <Button onClick={generateAiDraft} disabled={locked}>
                {workflow === "ai" ? (aiUsed ? "AI Draft Generated" : "Generate AI Draft") : "Ask AI (stub)"}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={clearDraft}
              disabled={
                locked ||
                text.length === 0 ||
                workflow === "ai" // prevent clearing in AI-only
              }
            >
              Clear
            </Button>
            <div className="ml-auto text-sm text-gray-500">
              {locked
                ? "Locked: time is up or already submitted."
                : workflow === "ai"
                  ? aiUsed ? "AI-only: review and submit." : "AI-only: generate draft to proceed."
                  : readOnly
                    ? "Editing locked until AI draft is generated."
                    : "Editing enabled."}
            </div>
          </div>
        </section>

        {/* Editor Card */}
        <section className="mt-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="draft" className="text-sm font-medium">
                {workflow === "ai" ? "AI draft (read-only)" : "Your draft"}
              </Label>
              <span className="text-xs text-gray-500">{text.length} characters</span>
            </div>
            <Textarea
              id="draft"
              rows={14}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                workflow === "ai"
                  ? "Click 'Generate AI Draft' to see the output…"
                  : "Write here…"
              }
              readOnly={readOnly}
              className={readOnly ? "bg-gray-100" : ""}
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button onClick={submit} disabled={submitDisabled}>
                Submit
              </Button>
            </div>
          </div>
        </section>

        {/* Footer hint */}
        <footer className="mt-6 text-center text-xs text-gray-400">
          Prototype UI — no data is saved yet.
        </footer>
      </div>
    </main>
  );
}
