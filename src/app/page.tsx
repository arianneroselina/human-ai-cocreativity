"use client";

import { useMemo, useState } from "react";
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

  // RULES
  // - human: editable; no AI
  // - ai: AI one-shot; read-only always
  // - human_ai: human edits first; when AI edits, lock further editing
  // - ai_human: AI draft first (one-shot); then human can edit; AI disabled afterward
  const readOnly = useMemo(() => {
    if (locked) return true;
    if (workflow === "ai") return true;
    if (workflow === "ai_human" && !aiUsed) return true; // wait for AI first
    if (workflow === "human_ai" && aiUsed) return true;  // AI edited -> lock
    return false;
  }, [workflow, aiUsed, locked]);

  const generateAiDraft = () => {
    // AI-only: one-shot draft, always read-only
    if (workflow === "ai") {
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
      return;
    }

    // AI→Human: one-shot AI draft, then human edits; AI disabled after this
    if (workflow === "ai_human") {
      if (aiUsed) return;
      const draft = [
        "AI Draft — Starter",
        "Intro: …",
        "Main points: …",
        "Conclusion: …",
      ].join("\n");
      setText(draft);
      setAiUsed(true); // enables human editing (readOnly becomes false)
      return;
    }

    // Human→AI: require human text first; then AI "edits" and locks
    if (workflow === "human_ai") {
      if (!text.trim()) {
        alert("Please write something first before asking AI to edit.");
        return;
      }
      const edited = [
        "AI Edit — Revised Draft",
        "",
        text.trim(),
        "",
        "— Suggested improvements: clarify the hook, tighten transitions, add a concrete example."
      ].join("\n");
      setText(edited);
      setAiUsed(true); // locks editing
      return;
    }
  };

  const clearDraft = () => setText("");

  const submit = () => {
    setLocked(true);
    console.log("[submitted]", { workflow, length: text.length, text });
    alert("Submitted (stub). Check console for payload.");
  };

  const canGenerate = workflow === "ai" || workflow === "ai_human" || workflow === "human_ai";

  const aiButtonDisabled =
    locked ||
    (workflow === "ai" && aiUsed) ||               // AI-only: one-shot
    (workflow === "ai_human" && aiUsed) ||         // AI→Human: one-shot, then disable
    (workflow === "human_ai" && !text.trim());     // Human→AI: need human text first

  const submitDisabled =
    locked ||
    text.trim().length === 0 ||
    (workflow === "ai" && !aiUsed) ||              // AI-only must generate first
    (workflow === "ai_human" && !aiUsed);          // AI→Human must generate first

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
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
            value={workflow}
            onValueChange={(v) => {
              setWorkflow(v as Workflow);
              setAiUsed(false);
              if (v === "ai") setText("");
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
                <p>Write by yourself. No AI.</p>
              </TabsContent>
              <TabsContent value="ai">
                <p>Generate a single AI draft and submit. Editing is disabled.</p>
              </TabsContent>
              <TabsContent value="human_ai">
                <p>Write first. Then AI will edit your text. After AI edits, you cannot edit anymore.</p>
              </TabsContent>
              <TabsContent value="ai_human">
                <p>Start with an AI draft (one time). Afterwards, you can edit it; AI is disabled.</p>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        {/* Action Bar */}
        <section className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            {canGenerate && (
              <Button onClick={generateAiDraft} disabled={aiButtonDisabled}>
                {workflow === "ai"
                  ? aiUsed
                    ? "AI Draft Generated"
                    : "Generate AI Draft"
                  : workflow === "human_ai"
                    ? "Ask AI to Edit"
                    : aiUsed
                      ? "AI Disabled"
                      : "Generate AI Draft"}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={clearDraft}
              disabled={
                locked ||
                text.length === 0 ||
                workflow === "ai" ||                      // cannot clear AI-only
                (workflow === "human_ai" && aiUsed)       // locked after AI edit
              }
            >
              Clear
            </Button>
            <div className="ml-auto text-sm text-gray-500">
              {locked
                ? "Locked: time is up or already submitted."
                : workflow === "ai"
                  ? aiUsed ? "AI-only: review and submit." : "AI-only: generate draft to proceed."
                  : workflow === "ai_human"
                    ? aiUsed ? "You can edit now. AI disabled." : "Generate AI draft to begin."
                    : workflow === "human_ai"
                      ? aiUsed ? "AI edited your text. Editing locked." : "Write something, then ask AI to edit."
                      : "Editing enabled."}
            </div>
          </div>
        </section>

        {/* Editor Card */}
        <section className="mt-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="draft" className="text-sm font-medium">
                {workflow === "ai"
                  ? "AI draft (read-only)"
                  : workflow === "human_ai" && aiUsed
                    ? "AI-edited draft (locked)"
                    : "Your draft"}
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
                  : workflow === "human_ai"
                    ? "Write here… then click 'Ask AI to Edit'."
                    : workflow === "ai_human"
                      ? aiUsed
                        ? "You can now edit the AI draft…"
                        : "Click 'Generate AI Draft' to start…"
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
