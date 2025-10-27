"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExperimentRun } from '@/lib/experiment';
import { Workflow } from "@/lib/experiment";

type Event =
  | { type: 'START_SESSION'; totalTrials?: number }
  | { type: 'SELECT_WORKFLOW'; workflow: Workflow }
  | { type: 'LOCK_WORKFLOW' }
  | { type: 'SUBMIT_TRIAL' }
  | { type: 'NEXT_TRIAL' }
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
  totalTrials: 3,
  trialIndex: 0,
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
          case 'SUBMIT_TRIAL':     return run.phase === 'task';
          case 'NEXT_TRIAL':       return run.phase === 'submit';
          case 'FINISH_SESSION':   return run.phase === 'submit' && run.trialIndex >= run.totalTrials;
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
                s.totalTrials = Math.min(5, Math.max(3, event.totalTrials ?? s.totalTrials));
                s.trialIndex = 1;
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

            case 'SUBMIT_TRIAL': {
              if (state.can('SUBMIT_TRIAL')) {
                s.phase = 'submit';
              }
              return { run: s };
            }

            case 'NEXT_TRIAL': {
              if (state.can('NEXT_TRIAL')) {
                if (s.trialIndex < s.totalTrials) {
                  s.trialIndex += 1;
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
