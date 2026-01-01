"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExperimentRun, Workflow } from "@/lib/experiment";

type Event =
  | { type: "START_SESSION"; totalRounds?: number }
  | { type: "FINISH_PREQUESTIONNAIRE" }
  | { type: "FINISH_TUTORIAL" }
  | { type: "START_TRIAL" }
  | { type: "FINISH_TRIAL" }
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
}

function uuid() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

/** Deterministic PRNG seeded from string */
function makeRng(seed: string) {
  let x = 0;
  for (let i = 0; i < seed.length; i++) x = (x * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xffffffff;
  };
}

function shuffle<T>(arr: T[], seed: string): T[] {
  const rng = makeRng(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TRIAL_WORKFLOWS: Workflow[] = ["human", "ai", "human_ai", "ai_human"];

const initial: ExperimentRun = {
  participantId: null,
  sessionId: null,

  totalRounds: 3, // MAIN rounds (pilot)
  roundIndex: 0,

  phase: "idle",
  locked: false,
} as any;

export const useExperiment = create<Store>()(
  persist(
    (set, get) => ({
      run: initial,

      can(type) {
        const { run } = get();
        const r: any = run;

        switch (type) {
          case "START_SESSION":
            return run.phase === "idle";

          case "FINISH_PREQUESTIONNAIRE":
            return run.phase === "pre-questionnaire";

          case "FINISH_TUTORIAL":
            return run.phase === "tutorial";

          case "FINISH_TRIAL":
            return run.phase === "trial";

          case "SELECT_WORKFLOW":
            return run.phase === "choose_workflow" && !run.locked;

          case "LOCK_WORKFLOW":
            return run.phase === "choose_workflow" && !!r.workflow;

          case "SUBMIT_ROUND":
            return run.phase === "task";

          case "NEXT_ROUND":
            return run.phase === "round_feedback" || (run.phase === "trial_pause" && r.mode === "trial");

          case "FINISH_SESSION":
            return run.phase === "round_feedback" && run.roundIndex >= run.totalRounds;

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

              // MAIN rounds config
              const mainTotal = Math.min(5, Math.max(3, event.totalRounds ?? s.totalRounds ?? 3));
              s.totalRounds = mainTotal;
              s.roundIndex = 1;

              // Reset workflow selection (main)
              s.workflow = undefined;
              s.locked = false;

              s.tutorialDone = false;

              s.mode = "trial";
              s.trialTotal = 4;
              s.trialIndex = 1;
              s.trialOrder = shuffle(
                TRIAL_WORKFLOWS,
                `${String(s.participantId)}:${String(s.sessionId)}`
              );

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
              // start trial
              s.phase = "trial";
              return { run: s };
            }

            case "START_TRIAL": {
              if (s.phase !== "trial") return state;

              s.mode = "trial";
              s.locked = true;

              const idx = Math.max(0, Number(s.trialIndex ?? 1) - 1);
              s.workflow = (s.trialOrder?.[idx] ?? "human") as Workflow;

              s.phase = "task";
              return { run: s };
            }

            case "SUBMIT_ROUND": {
              if (!can("SUBMIT_ROUND")) return state;

              if (s.mode === "trial") {
                s.phase = "trial_pause";
              } else {
                s.phase = "round_feedback";
              }
              return { run: s };
            }

            case "NEXT_ROUND": {
              if (!can("NEXT_ROUND")) return state;

              if (s.phase === "trial_pause" && s.mode === "trial") {
                const total = Number(s.trialTotal ?? 4);
                const current = Number(s.trialIndex ?? 1);

                if (current < total) {
                  s.trialIndex = current + 1;
                  s.mode = "trial";
                  s.locked = true;
                  s.workflow = (s.trialOrder?.[s.trialIndex - 1] ?? "human") as Workflow;
                  s.phase = "task";
                } else {
                  s.mode = "main";
                  s.phase = "choose_workflow";
                  s.locked = false;
                  s.workflow = undefined;
                }
                return { run: s };
              }

              if (s.phase === "round_feedback") {
                if (s.roundIndex < s.totalRounds) {
                  s.roundIndex += 1;
                  s.mode = "main";
                  s.phase = "choose_workflow";
                  s.locked = false;
                  s.workflow = undefined;
                } else {
                  s.phase = "feedback";
                }
                return { run: s };
              }

              return state;
            }

            case "FINISH_TRIAL": {
              if (!can("FINISH_TRIAL")) return state;

              s.mode = "main";
              s.phase = "choose_workflow";
              s.locked = false;
              s.workflow = undefined;
              return { run: s };
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
