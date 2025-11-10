"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExperimentRun } from '@/lib/experiment';
import { Workflow } from "@/lib/experiment";

type Event =
  | { type: 'START_SESSION'; totalRounds?: number }
  | { type: 'SELECT_WORKFLOW'; workflow: Workflow }
  | { type: 'LOCK_WORKFLOW' }
  | { type: 'SUBMIT_ROUND' }
  | { type: 'NEXT_ROUND' }
  | { type: 'FINISH_SESSION' }
  | { type: 'RESET' };

interface Store {
  run: ExperimentRun;
  can(event: Event['type']): boolean;
  send(event: Event): void;
}

const initial: ExperimentRun = {
  participantId: null,
  sessionId: null,
  totalRounds: 3,
  roundIndex: 0,
  phase: 'idle',
  locked: false
};

function uuid() {
  return (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
}

export const useExperiment = create<Store>()(
  persist(
    (set, get) => ({
      run: initial,

      can(type) {
        const { run } = get();
        switch (type) {
          case 'START_SESSION':    return run.phase === 'idle';
          case 'SELECT_WORKFLOW':  return run.phase === 'choose_workflow' && !run.locked;
          case 'LOCK_WORKFLOW':    return run.phase === 'choose_workflow' && !!run.workflow;
          case 'SUBMIT_ROUND':     return run.phase === 'task';
          case 'NEXT_ROUND':       return run.phase === 'round_feedback';
          case 'FINISH_SESSION':   return run.phase === 'round_feedback' && run.roundIndex >= run.totalRounds;
          case 'RESET':            return true;
          default:                 return false;
        }
      },

      send(event) {
        set((state) => {
          const s = { ...state.run };

          switch (event.type) {
            case 'START_SESSION': {
              if (state.can('START_SESSION')) {
                s.participantId = s.participantId ?? uuid();
                s.sessionId = uuid();
                s.totalRounds = Math.min(5, Math.max(3, event.totalRounds ?? s.totalRounds));
                s.roundIndex = 1;
                s.phase = 'choose_workflow';
                s.locked = false;
                s.workflow = undefined;
              }
              return { run: s };
            }

            case 'SELECT_WORKFLOW': {
              if (state.can('SELECT_WORKFLOW')) {
                s.workflow = event.workflow;
                // still in choose_workflow; user can review once before locking
              }
              return { run: s };
            }

            case 'LOCK_WORKFLOW': {
              if (state.can('LOCK_WORKFLOW')) {
                s.locked = true;
                s.phase = 'task'; // move to task
              }
              return { run: s };
            }

            case 'SUBMIT_ROUND': {
              if (state.can('SUBMIT_ROUND')) {
                s.phase = 'round_feedback';
              }
              return { run: s };
            }

            case 'NEXT_ROUND': {
              if (state.can('NEXT_ROUND')) {
                if (s.roundIndex < s.totalRounds) {
                  s.roundIndex += 1;
                  s.phase = 'choose_workflow';
                  s.locked = false;
                  s.workflow = undefined;
                } else {
                  // safety: if someone presses next after last, finish
                  s.phase = 'feedback';
                }
              }
              return { run: s };
            }

            case 'FINISH_SESSION': {
              if (state.can('FINISH_SESSION')) {
                s.phase = 'feedback';
              }
              return { run: s };
            }

            case 'RESET': {
              return { run: initial };
            }

            default:
              return state;
          }
        });
      }
    }),
    { name: 'experiment-run-v1' }
  )
);
