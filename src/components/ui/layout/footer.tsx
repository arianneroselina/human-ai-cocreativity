"use client";

import { Mail } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn_ui/tooltip";

export default function Footer() {
  const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "vincentiarianne@gmail.com";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/60 text-card-foreground backdrop-blur">
      <div className="mx-auto w-full px-4 py-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label="Email us"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border
                bg-accent text-accent-foreground hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Mail className="h-4 w-4" />
                <span className="sr-only">Email us</span>
              </a>
            </TooltipTrigger>
            <TooltipContent className="text-sm">Email us</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>© {year} Human-AI Co-Creativity</span>
        </div>
      </div>
    </footer>
  );
}
