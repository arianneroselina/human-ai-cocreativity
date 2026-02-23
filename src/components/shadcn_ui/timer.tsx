"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const timerBadgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-sm bg-white [&_.time]:tabular-nums",
  {
    variants: {
      intent: {
        default: "border-gray-200 text-gray-900",
        warning: "border-yellow-300 text-yellow-800 bg-yellow-50",
        danger: "border-red-300 text-red-800 bg-red-50",
        success: "border-emerald-300 text-emerald-800 bg-emerald-50",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      intent: "default",
      size: "md",
    },
  }
);

export interface TimerBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof timerBadgeVariants> {
  asChild?: boolean;
  seconds?: number;
  running?: boolean;
  onDone?: () => void;
  showIcon?: boolean;
}

const TimerBadge = React.forwardRef<HTMLDivElement, TimerBadgeProps>(
  (
    {
      asChild = false,
      className,
      intent,
      size,
      seconds = 600,
      running = true,
      onDone,
      showIcon = true,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";

    const [left, setLeft] = React.useState(seconds);

    // Reset if the initial seconds prop changes
    React.useEffect(() => {
      setLeft(seconds);
    }, [seconds]);

    // Tick
    React.useEffect(() => {
      if (!running) return;
      if (left <= 0) {
        onDone?.();
        return;
      }
      const id = window.setInterval(() => setLeft((s) => s - 1), 1000);
      return () => window.clearInterval(id);
    }, [left, running, onDone]);

    const mm = String(Math.floor(left / 60)).padStart(2, "0");
    const ss = String(left % 60).padStart(2, "0");

    return (
      <Comp ref={ref} className={cn(timerBadgeVariants({ intent, size }), className)} {...props}>
        {showIcon && <span className="opacity-70">⏱</span>}
        <span className="time">
          {mm}:{ss}
        </span>
      </Comp>
    );
  }
);
TimerBadge.displayName = "TimerBadge";

export { TimerBadge, timerBadgeVariants };
