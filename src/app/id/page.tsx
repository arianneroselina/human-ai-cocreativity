"use client";

import { useState } from "react";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { Button } from "@/components/shadcn_ui/button";

export default function IdPage() {
  useRouteGuard(["id"]);
  const { send } = useExperiment();

  const [participantId, setParticipantId] = useState("");

  const isValidParticipantId =
    participantId.length > 0 &&
    participantId.length <= 3 &&
    /^\d+$/.test(participantId);

  const handleSubmit = async () => {
    if (!isValidParticipantId) return;

    const { run } = useExperiment.getState();

    await fetch("/api/id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: run.sessionId,
        participantId: Number(participantId)
      }),
    });

    console.log("ID submitted:", {
      sessionId: run.sessionId,
      participantId: Number(participantId)
    });

    send({ type: "START_TUTORIAL" });
  };

  return (
    <main className="h-full flex items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Enter Participant ID
        </h1>

        <p className="text-sm text-muted-foreground">
          Please enter your participant ID provided by the researcher.
        </p>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={3}
          value={participantId}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setParticipantId(value);
          }}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g. 123"
          required
        />

        <Button
          onClick={handleSubmit}
          disabled={!isValidParticipantId}
          className="w-full"
        >
          Continue
        </Button>
      </div>
    </main>
  );
}
