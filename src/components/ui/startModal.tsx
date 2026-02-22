import WorkflowDetails from "@/components/ui/workflowDetails";
import { Button } from "@/components/shadcn_ui/button";
import React from "react";

export default function StartModal({
                                     open,
                                     workflow,
                                     onStart,
                                   }: {
  open: boolean;
  workflow: any;
  onStart: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-[min(720px,calc(100%-2rem))] rounded-2xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8">

          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Get Ready for This Round🚀
            </h2>

            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Please carefully read the workflow instructions below.
            </p>
          </div>

          <WorkflowDetails workflow={workflow} />

          <div className="mt-5 rounded-lg border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-foreground">
            ⏱️ The timer starts immediately after you click Start.
            Make sure you fully understand the instructions before proceeding.
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={onStart}
              size="lg"
              className="px-8 text-base shadow-md"
            >
              Start Round
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}