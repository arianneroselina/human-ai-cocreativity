"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { Label } from "@/components/shadcn_ui/label";
import { Textarea } from "@/components/shadcn_ui/textarea";
import TaskDetails from "@/components/ui/taskDetails";
import Header from "@/components/ui/header";
import ConfirmDialog from "@/components/ui/confirm";
import { countWords, checkWords } from "@/utils/check";
import { submitData } from "@/utils/submit";

export default function HumanWorkPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const readOnly = useMemo(() => locked, [locked]);
  const words = countWords(text);
  const { meetsRequiredWords, meetsAvoidWords } = checkWords(text);

  const clearDraft = () => setText("");

  const submit = () => {
    setLocked(true);
    submitData(words, meetsRequiredWords, meetsAvoidWords, text, router);
  };

  const submitDisabled = locked || text.trim().length === 0;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <Header workflow="Human only"/>

      <div className="mx-auto max-w-4xl p-6">
        {/* Info */}
        <TaskDetails/>

        {/* Actions */}
        <section className="mt-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm items-center">
            <p className="text-sm text-gray-600">
              Write entirely by yourself. <span className="font-medium">No AI available.</span> Submit before time runs out.
            </p>
          </div>
        </section>

        {/* Editor Section */}
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
          </div>
        </section>

        <footer className="mt-6 text-center text-xs text-gray-400">
          Prototype UI — no data is saved yet.
        </footer>
      </div>
    </main>
  );
}
