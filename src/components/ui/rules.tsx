"use client";

import { Lock, ShieldCheck, Timer } from "lucide-react";

export default function Rules() {
  return (
    <>
      <div className="mt-5">
        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            No personal data is collected.
          </li>
          <li className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            You can’t change workflow after starting a round.
          </li>
          <li className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5" />
            Each round is time-boxed; please submit before time runs out.
          </li>
        </ul>
      </div>
    </>
  );
}
