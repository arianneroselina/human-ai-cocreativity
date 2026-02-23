"use client";

import { Human, Ai, AiHuman, HumanAi, Workflow, Workflows } from "@/lib/experiment";
import React from "react";

export default function WorkflowDetails({ workflow }: { workflow: Workflow | undefined }) {
  if (workflow === Human) {
    return (
      <div
        className={[
          "mb-3 mt-3 rounded-xl p-3 shadow-2xl",
          "border border-border/60",
          "bg-gradient-to-r from-primary/10 via-primary/5 to-background",
        ].join(" ")}
      >
        {/* Title + description */}
        <div className="text-center mb-3">
          <p className="font-semibold text-sm text-foreground">
            {Workflows.find((w) => w.key === workflow)?.label} workflow
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {Workflows.find((w) => w.key === workflow)?.desc}
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 text-[11px]">
          {[
            { icon: "✍️", label: "Write draft" },
            { icon: "✅", label: "Submit" },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-0.5 flex-1">
                <div
                  className={[
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    "border border-border/60 shadow-md transition-all",
                    "bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40",
                    "text-primary-foreground text-sm group-hover:shadow-lg",
                  ].join(" ")}
                >
                  {step.icon}
                </div>
                <span className="font-medium text-foreground leading-tight text-center">
                  {step.label}
                </span>
              </div>

              {i < 1 && (
                <div className="w-4 flex justify-center">
                  <div className="w-4 h-1 rounded-full bg-primary/40" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (workflow === Ai) {
    return (
      <div
        className={[
          "mb-3 mt-3 rounded-xl p-3 shadow-2xl",
          "border border-border/60",
          "bg-gradient-to-r from-primary/10 via-primary/5 to-background",
        ].join(" ")}
      >
        {/* Title + description */}
        <div className="text-center mb-3">
          <p className="font-semibold text-sm text-foreground">
            {Workflows.find((w) => w.key === workflow)?.label} workflow
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {Workflows.find((w) => w.key === workflow)?.desc}
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 text-[11px]">
          {[
            { icon: "🤖", label: "Chat & pick draft" },
            { icon: "✅", label: "Submit" },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-0.5 flex-1">
                <div
                  className={[
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    "border border-border/60 shadow-md transition-all",
                    "bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40",
                    "text-primary-foreground text-sm group-hover:shadow-lg",
                  ].join(" ")}
                >
                  {step.icon}
                </div>
                <span className="font-medium text-foreground leading-tight text-center">
                  {step.label}
                </span>
              </div>

              {i < 1 && (
                <div className="w-4 flex justify-center">
                  <div className="w-4 h-1 rounded-full bg-primary/40" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (workflow === AiHuman) {
    return (
      <div
        className={[
          "mb-3 mt-3 rounded-xl p-3 shadow-2xl",
          "border border-border/60",
          "bg-gradient-to-r from-primary/10 via-primary/5 to-background",
        ].join(" ")}
      >
        {/* Title + description */}
        <div className="text-center mb-3">
          <p className="font-semibold text-sm text-foreground">
            {Workflows.find((w) => w.key === workflow)?.label} workflow
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {Workflows.find((w) => w.key === workflow)?.desc}
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 text-[11px]">
          {[
            { icon: "📝", label: "Chat & pick draft" },
            { icon: "🔒", label: "Lock AI" },
            { icon: "✏️", label: "Edit draft" },
            { icon: "✅", label: "Submit" },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-0.5 flex-1">
                <div
                  className={[
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    "border border-border/60 shadow-md transition-all",
                    "bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40",
                    "text-primary-foreground text-sm group-hover:shadow-lg",
                  ].join(" ")}
                >
                  {step.icon}
                </div>
                <span className="font-medium text-foreground leading-tight text-center">
                  {step.label}
                </span>
              </div>

              {i < 3 && (
                <div className="w-4 flex justify-center">
                  <div className="w-4 h-1 rounded-full bg-primary/40" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (workflow === HumanAi) {
    return (
      <div
        className={[
          "mb-3 mt-3 rounded-xl p-3 shadow-2xl",
          "border border-border/60",
          "bg-gradient-to-r from-primary/10 via-primary/5 to-background",
        ].join(" ")}
      >
        {/* Title + description */}
        <div className="text-center mb-3">
          <p className="font-semibold text-sm text-foreground">
            {Workflows.find((w) => w.key === workflow)?.label} workflow
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {Workflows.find((w) => w.key === workflow)?.desc}
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 text-[11px]">
          {[
            { icon: "✍️", label: "Write draft" },
            { icon: "🔓", label: "Unlock AI" },
            { icon: "🤖", label: "Chat & pick edit" },
            { icon: "✅", label: "Submit" },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-0.5 flex-1">
                <div
                  className={[
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    "border border-border/60 shadow-md transition-all",
                    "bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40",
                    "text-primary-foreground text-sm group-hover:shadow-lg",
                  ].join(" ")}
                >
                  {step.icon}
                </div>
                <span className="font-medium text-foreground leading-tight text-center">
                  {step.label}
                </span>
              </div>

              {i < 3 && (
                <div className="w-4 flex justify-center">
                  <div className="w-4 h-1 rounded-full bg-primary/40" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
}
