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

export default function AIHumanWorkPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  // readOnly until AI generates; afterward editable (unless locked)
  const readOnly = useMemo(() => locked || !aiGenerated, [locked, aiGenerated]);
  const words = countWords(text);

  const generateAiDraft = () => {
    if (aiGenerated) return;
    const draft = [
      "AI Draft — Starter",
      "Intro: …",
      "Main points: …",
      "Conclusion: …",
    ].join("\n");
    setText(draft);
    setAiGenerated(true); // AI disabled after this
  };

  const clearDraft = () => setText("");

  const submit = () => {
    setLocked(true);
    console.log("[submitted]", { workflow: "human", length: text.length, text });
    alert("Submitted (stub). Check console for payload.");
    router.push("/result");
  };

  const submitDisabled = locked || text.trim().length === 0 || !aiGenerated;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <Header workflow="AI → Human"/>

      <div className="mx-auto max-w-4xl p-6">
        {/* Info */}
        <TaskDetails/>

        {/* Actions */}
        <section className="mt-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm items-center">
            <p className="text-sm text-gray-600">
              Generate an AI draft <span className="font-medium">once</span>, then edit freely. AI is disabled afterwards.
            </p>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={generateAiDraft} disabled={locked || aiGenerated}>
                {aiGenerated ? "AI Draft Generated (AI Disabled)" : "Generate AI Draft"}
              </Button>
              <Button
                variant="secondary"
                onClick={clearDraft}
                disabled={locked || text.length === 0}
              >
                Clear
              </Button>
              <span className="ml-auto text-sm text-gray-500">
                {aiGenerated ? "You can edit now. AI is disabled." : "Generate the AI draft to begin."}
              </span>
            </div>
          </div>
        </section>

        {/* Editor */}
        <section className="mt-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="draft" className="text-sm font-medium">
                {aiGenerated ? "Draft (you can edit)" : "AI draft will appear here"}
              </Label>
              <span className="text-xs text-gray-500">
                {words} words • {text.length} chars
              </span>
            </div>
            <Textarea
              id="draft"
              rows={14}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={aiGenerated ? "You can now edit the AI draft..." : "Click 'Generate AI Draft' to start..."}
              readOnly={readOnly}
              className={readOnly ? "bg-gray-100" : ""}
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
