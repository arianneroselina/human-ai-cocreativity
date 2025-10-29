"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails from "@/components/ui/taskDetails";
import Header from "@/components/ui/header";
import ConfirmDialog from "@/components/ui/confirm";
import { countWords, checkWords } from "@/lib/check";
import { submitData } from "@/lib/submit";
import { usePreventBack } from "@/lib/usePreventBack";
import { useWorkflowGuard } from "@/lib/useWorkflowGuard";
import { useExperiment } from "@/stores/useExperiment";
import {useRouteGuard} from "@/lib/useRouteGuard";
import Rules from "@/components/ui/rules";
import Progress from "@/components/ui/progress";

export default function HumanAIPage() {
  useRouteGuard(['task']);
  useWorkflowGuard();
  usePreventBack(true);

  const { run, send } = useExperiment();
  const router = useRouter();

  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [aiEdited, setAiEdited] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const readOnly = useMemo(() => locked || aiEdited, [locked, aiEdited]);
  const words = countWords(text);
  const { meetsRequiredWords, meetsAvoidWords } = checkWords(text);

  const askAIToEdit = () => {
    if (aiEdited) return;
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
    setAiEdited(true); // lock editor
  };

  const clearDraft = () => setText("");

  const submit = () => {
    setLocked(true);
    submitData(words, meetsRequiredWords, meetsAvoidWords, text, router);
    send({ type: 'SUBMIT_TRIAL' });
  };

  const submitDisabled = locked || text.trim().length === 0 || !aiEdited;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header workflow="Human → AI" trial={run.trialIndex}/>
      <Progress />

      <div className="mx-auto max-w-4xl p-6">
        {/* Info */}
        <TaskDetails/>

        {/* Actions */}
        <section className="mt-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm items-center">
            <p className="text-sm text-gray-600">
              Write first. Then ask AI to edit <span className="font-medium">once</span>. After AI edits, editing is locked.
            </p>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={askAIToEdit} disabled={locked || aiEdited || text.trim().length === 0}
                      className="bg-[var(--purple)]"
              >
                {aiEdited ? "AI Edit Applied (Locked)" : "Ask AI to Edit"}
              </Button>
              <Button
                variant="secondary"
                onClick={clearDraft}
                disabled={locked || text.length === 0 || aiEdited}
              >
                Clear
              </Button>
              <span className="ml-auto text-sm text-gray-500">
                {aiEdited ? "AI edited your text. Editing is locked." : "Write your draft, then ask AI to edit."}
              </span>
            </div>
          </div>
        </section>

        {/* Editor */}
        <section className="mt-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="draft" className="text-sm font-medium">
                {aiEdited ? "AI-edited draft (locked)" : "Your draft"}
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
              placeholder="Write here… then click 'Ask AI to Edit'."
              readOnly={readOnly}
              className={readOnly ? "bg-gray-100" : ""}
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <Rules/>

              <Button onClick={() => setSubmitOpen(true)} disabled={submitDisabled}
                      className="bg-[var(--purple)]"
              >
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
      </div>
    </main>
  );
}
