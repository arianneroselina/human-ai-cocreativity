"use client";

import { createContext, useContext, useState } from "react";

const PauseContext = createContext<{
  paused: boolean;
  setPaused: (v: boolean) => void;
} | null>(null);

export function PauseProvider({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = useState(false);
  return (
    <PauseContext.Provider value={{ paused, setPaused }}>
      {children}
    </PauseContext.Provider>
  );
}

export function usePause() {
  const ctx = useContext(PauseContext);
  if (!ctx) throw new Error("usePause must be used inside PauseProvider");
  return ctx;
}
