"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ExperimentRun, Workflow } from "@/lib/experiment";
import { createRandomAssignments } from "@/lib/roundAssignment";

type Event =
  | { type: "START_SESSION" }
  | { type: "FINISH_PREQUESTIONNAIRE" }
  | { type: "FINISH_TUTORIAL" }
  | { type: "START_PRACTICE" }
  | { type: "SELECT_WORKFLOW"; workflow: Workflow }
  | { type: "LOCK_WORKFLOW" }
  | { type: "SUBMIT_ROUND" }
  | { type: "NEXT_ROUND" }
  | { type: "FINISH_SESSION" }
  | { type: "RESET" };

interface Store {
  run: ExperimentRun;
  can(event: Event["type"]): boolean;
  send(event: Event): void;
  setRoundStarted: (startedAt: string) => void;
}

function uuid() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

const initial: ExperimentRun = {
  participantId: null,
  sessionId: null,
  totalRounds: 3,
  totalPracticeRounds: 4,
  roundIndex: 1,
  phase: "idle",
  locked: false,
} as any;

export const useExperiment = create<Store>()(
  persist(
    (set, get) => ({
      run: initial,

      setRoundStarted(startedAt) {
        set((state) => ({
          run: {
            ...state.run,
            startedAt,
          },
        }));
      },

      can(type) {
        const { run } = get();

        switch (type) {
          case "START_SESSION":
            return run.phase === "idle";

          case "FINISH_PREQUESTIONNAIRE":
            return run.phase === "pre-questionnaire";

          case "FINISH_TUTORIAL":
            return run.phase === "tutorial";

          case "SELECT_WORKFLOW":
            return run.phase === "choose_workflow" && !run.locked;

          case "LOCK_WORKFLOW":
            return run.phase === "choose_workflow" && !!run.workflow;

          case "SUBMIT_ROUND":
            return run.phase === "task";

          case "NEXT_ROUND":
            return run.phase === "round_feedback" || run.phase === "practice_complete";

          case "FINISH_SESSION":
            return run.phase === "round_feedback" && run.roundIndex >= run.totalRounds + run.totalPracticeRounds;

          case "RESET":
            return true;

          default:
            return false;
        }
      },

      send(event) {
        set((state) => {
          const s = { ...state.run } as any;
          const can = state.can;

          switch (event.type) {
            case "START_SESSION": {
              if (!can("START_SESSION")) return state;

              s.participantId = s.participantId ?? uuid();
              s.sessionId = uuid();

              s.totalRounds = 3;
              s.roundIndex = 1;

              s.assignments = createRandomAssignments({
                totalPracticeRounds: s.totalPracticeRounds,
                totalMainRounds: s.totalRounds,
              });

              // Reset workflow selection (main)
              s.workflow = s.assignments[0]?.workflow as Workflow;
              s.taskId = s.assignments[0]?.taskId;
              s.locked = false;

              s.tutorialDone = false;

              s.mode = "practice";
              s.totalPracticeRounds = 4;

              s.phase = "pre-questionnaire";
              return { run: s };
            }

            case "FINISH_PREQUESTIONNAIRE": {
              if (!can("FINISH_PREQUESTIONNAIRE")) return state;
              s.phase = "tutorial";
              return { run: s };
            }

            case "FINISH_TUTORIAL": {
              if (!can("FINISH_TUTORIAL")) return state;
              s.tutorialDone = true;
              // start practice
              s.phase = "practice";
              return { run: s };
            }

            case "START_PRACTICE": {
              if (s.phase !== "practice") return state;

              s.mode = "practice";
              s.locked = true;

              const idx = Number(s.roundIndex ?? 1) - 1;
              s.workflow = s.assignments[idx]?.workflow as Workflow;
              s.taskId = s.assignments[idx]?.taskId;

              s.phase = "task";
              return { run: s };
            }

            case "SUBMIT_ROUND": {
              if (!can("SUBMIT_ROUND")) return state;
              s.phase = "round_feedback";
              return { run: s };
            }

            case "NEXT_ROUND": {
              if (!can("NEXT_ROUND")) return state;

              if (s.mode === "practice") {
                if (s.roundIndex < s.totalPracticeRounds) {
                  s.mode = "practice";
                  s.locked = true;
                  s.workflow = s.assignments[s.roundIndex]?.workflow as Workflow // roundIndex is not yet updated
                  s.taskId = s.assignments[s.roundIndex]?.taskId
                  s.phase = "practice";
                  s.roundIndex += 1;
                } else {
                  s.mode = "main";
                  s.phase = "practice_complete";
                  s.locked = false;
                  s.workflow = undefined;
                }
                return { run: s };
              }

              if (s.phase === "round_feedback" || s.phase === "practice_complete") {
                if (s.roundIndex < s.totalRounds + s.totalPracticeRounds) {
                  s.mode = "main";
                  s.phase = "choose_workflow";
                  s.locked = false;
                  s.workflow = undefined;
                  s.taskId = s.assignments[s.roundIndex]?.taskId // roundIndex is not yet updated
                  s.roundIndex += 1;
                } else {
                  s.phase = "feedback";
                }
                return { run: s };
              }

              return state;
            }

            case "SELECT_WORKFLOW": {
              if (!can("SELECT_WORKFLOW")) return state;
              s.workflow = event.workflow;
              return { run: s };
            }

            case "LOCK_WORKFLOW": {
              if (!can("LOCK_WORKFLOW")) return state;
              s.mode = "main";
              s.locked = true;
              s.phase = "task";
              return { run: s };
            }

            case "FINISH_SESSION": {
              if (!can("FINISH_SESSION")) return state;
              s.phase = "feedback";
              return { run: s };
            }

            case "RESET": {
              return { run: initial as any };
            }

            default:
              return state;
          }
        });
      },
    }),
    { name: "experiment-run-v2" }
  )
);
