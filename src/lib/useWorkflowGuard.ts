"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useExperiment } from "@/stores/useExperiment";

export function useWorkflowGuard() {
  const { run } = useExperiment();
  const router = useRouter();
  const path = usePathname();             // e.g. "/task/ai"
  const choice = path.split("/").pop()!;  // "ai"

  useEffect(() => {
    // No session yet
    if (run.phase === "idle") {
      router.replace("/");
      return;
    }

    // If user is not in "task" phase, bounce them to the correct screen.
    // (This prevents entering /task/* directly during tutorial, practice pause, etc.)
    if (run.phase !== "task") {
      if (run.phase === "pre-questionnaire") router.replace("/pre-questionnaire");
      else if (run.phase === "tutorial") router.replace("/tutorial");
      else if (run.phase === "practice") router.replace("/practice");
      else if (run.phase === "practice_pause") router.replace("/practice/pause");
      else if (run.phase === "choose_workflow") router.replace("/choose");
      else if (run.phase === "round_feedback") router.replace("/feedback/round");
      else if (run.phase === "feedback") router.replace("/feedback/session");
      else router.replace("/"); // fallback
      return;
    }

    // Now we are in "task" phase:
    if (!run.locked || !run.workflow) {
      if ((run as any).mode === "practice") router.replace("/practice");
      else router.replace("/choose");
      return;
    }

    if (choice !== run.workflow) {
      router.replace(`/task/${run.workflow}`);
      return;
    }
  }, [run.phase, run.locked, run.workflow, router, choice]);
}
