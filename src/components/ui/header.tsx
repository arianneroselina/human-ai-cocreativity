"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn_ui/button";
import { TimerBadge } from "@/components/shadcn_ui/timer";
import ConfirmDialog from "@/components/ui/confirm";
import {useState} from "react";

interface HeaderProps {
  workflow: string;
}

export default function Header({ workflow }: HeaderProps) {
  const router = useRouter();
  const [backOpen, setBackOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-4xl p-4 flex items-center gap-3">
        <Button variant="ghost" onClick={() => setBackOpen(true)} aria-label="Change workflow">
          ← Back
        </Button>

        <ConfirmDialog
          open={backOpen}
          onOpenChange={setBackOpen}
          title="Leave this session?"
          description="Your current draft won't be saved (prototype). Go back to the workflow selection?"
          confirmLabel="Go back"
          cancelLabel="Stay here"
          onConfirm={() => router.push("/")}
        />

        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Human–AI Co-Creativity</h1>
          <p className="text-xs text-gray-500">Workflow: <span className="font-medium text-gray-800">{workflow}</span></p>
        </div>
        <TimerBadge seconds={600} onDone={() => setBackOpen(true)} running={!backOpen} />
      </div>
    </div>
  );
}
