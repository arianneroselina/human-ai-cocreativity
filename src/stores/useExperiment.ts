"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {ExperimentRun, isPracticeMode, Workflow} from "@/lib/experiment";
import { createRandomAssignments } from "@/lib/roundAssignment";

type Event =
  | { type: "START_SESSION" }
  | { type: "START_TUTORIAL" }
  | { type: "START_PRACTICE" }
  | { type: "START_PRACTICE_ROUND" }
  | { type: "SELECT_WORKFLOW"; workflow: Workflow }
  | { type: "START_MAIN_ROUND" }
  | { type: "START_ROUND_FEEDBACK" }
  | { type: "NEXT_ROUND" }
  | { type: "START_FINAL_FEEDBACK" }
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

          case "START_TUTORIAL":
            return run.phase === "pre-questionnaire";

          case "START_PRACTICE":
            return run.phase === "tutorial";

          case "START_PRACTICE_ROUND":
            return run.phase === "practice";

          case "SELECT_WORKFLOW":
            return run.phase === "choose_workflow" && !run.locked;

          case "START_MAIN_ROUND":
            return run.phase === "choose_workflow" && !!run.workflow;

          case "START_ROUND_FEEDBACK":
            return run.phase === "task";

          case "NEXT_ROUND":
            return run.phase === "round_feedback" || run.phase === "practice_complete";

          case "START_FINAL_FEEDBACK":
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

            case "START_TUTORIAL": {
              if (!can("START_TUTORIAL")) return state;
              s.phase = "tutorial";
              return { run: s };
            }

            case "START_PRACTICE": {
              if (!can("START_PRACTICE")) return state;
              s.tutorialDone = true;
              s.phase = "practice";
              return { run: s };
            }

            case "START_PRACTICE_ROUND": {
              if (!can("START_PRACTICE_ROUND")) return state;

              s.mode = "practice";
              s.locked = true;

              const idx = Number(s.roundIndex ?? 1) - 1;
              s.workflow = s.assignments[idx]?.workflow as Workflow;
              s.taskId = s.assignments[idx]?.taskId;
              s.startedAt = undefined;

              s.phase = "task";
              return { run: s };
            }

            case "START_ROUND_FEEDBACK": {
              if (!can("START_ROUND_FEEDBACK")) return state;
              s.phase = "round_feedback";
              return { run: s };
            }

            case "NEXT_ROUND": {
              if (!can("NEXT_ROUND")) return state;

              if (isPracticeMode(s.mode)) {
                if (s.roundIndex < s.totalPracticeRounds) {
                  s.mode = "practice";
                  s.locked = true;

                  const nextIdx = s.roundIndex;
                  s.workflow = s.assignments[nextIdx]?.workflow;
                  s.taskId = s.assignments[nextIdx]?.taskId;

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

                  const nextIdx = s.roundIndex;
                  s.workflow = undefined;
                  s.taskId = s.assignments[nextIdx]?.taskId

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

            case "START_MAIN_ROUND": {
              if (!can("START_MAIN_ROUND")) return state;
              s.mode = "main";
              s.locked = true;
              s.startedAt = undefined;
              s.phase = "task";
              return { run: s };
            }

            case "START_FINAL_FEEDBACK": {
              if (!can("START_FINAL_FEEDBACK")) return state;
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
