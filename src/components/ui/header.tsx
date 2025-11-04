"use client";

import { TimerBadge } from "@/components/shadcn_ui/timer";
import { Bug, FileText, Moon, Pause, Play, Sun } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

function getInitialDark() {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("theme");
  if (stored) return stored === "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // Initialize once on mount and sync document class
  useEffect(() => {
    const initial = getInitialDark();
    document.documentElement.classList.toggle("dark", initial);
    setDark(initial);

    // If user hasn't chosen a theme, follow system changes automatically
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onSystemChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        document.documentElement.classList.toggle("dark", e.matches);
        setDark(e.matches);
      }
    };
    if (media && !stored) {
      media.addEventListener?.("change", onSystemChange);
      media.addListener?.(onSystemChange); // for older Safari
      return () => {
        media.removeEventListener?.("change", onSystemChange);
        media.removeListener?.(onSystemChange);
      };
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-md border border-border bg-transparent p-1.5 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      type="button"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

interface HeaderProps {
  workflow: string;
  round: number;
}

export default function Header({ workflow, round }: HeaderProps) {
  const [paused, setPaused] = useState(false);
  const resumeBtnRef = useRef<HTMLButtonElement>(null);

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  useEffect(() => {
    if (paused) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      resumeBtnRef.current?.focus();
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!paused) return;
      if (e.key === " " || e.key === "Escape") {
        e.preventDefault();
        setPaused(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused]);

  return (
    <>
      <header className="relative w-full bg-primary text-white py-2">
        {/* Right utilities (absolute) */}
        <div className="absolute right-4 top-3/4 -translate-y-1/2 flex items-center gap-2">
          {process.env.NEXT_PUBLIC_APP_TAG && (
            <span className="hidden sm:inline rounded-md border border-white/25 bg-white/10 px-2 py-1 text-xs">
              {process.env.NEXT_PUBLIC_APP_TAG}
            </span>
          )}

          <Link
            href="https://github.com/arianneroselina/human-ai-cocreativity#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/10 px-2 py-1 text-xs hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            title="Open README"
            aria-label="Open README"
          >
            <FileText className="h-3.5 w-3.5" />
            Docs
          </Link>

          <Link
            href="https://github.com/arianneroselina/human-ai-cocreativity/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/10 px-2 py-1 text-xs hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            title="Report an issue"
            aria-label="Report an issue"
          >
            <Bug className="h-3.5 w-3.5" />
            Issue
          </Link>

          <Link
            href="https://github.com/arianneroselina/human-ai-cocreativity"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-2 py-1 text-xs hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            title="View source on GitHub"
            aria-label="View source on GitHub"
          >
            <Image src="/github_dark.png" alt="Github" width="16" height="16" className="object-contain" />
            Github
          </Link>

          <ThemeToggle />
        </div>

        {/* Center content */}
        <div className="flex items-center justify-center gap-6">
          <div className="w-32 h-32">
            <Image
              src="/human-ai-icon-white-transparent.png"
              alt="Human-AI Co-Creativity Logo"
              width={85}
              height={85}
              layout="responsive"
              className="object-contain"
            />
          </div>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Human-AI Co-Creativity</h1>
            <p className="mt-1 text-sm text-white/80">Experimental study interface</p>
          </div>
        </div>
      </header>

      {/* Round bar now uses theme tokens */}
      {round > 0 && (
        <div className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-4xl p-4 flex items-center gap-3">
            <div className="mr-auto">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Human-AI Co-Creativity</h1>
              <p className="text-xs text-muted-foreground">
                Round {round}: <span className="font-medium text-foreground">{workflow}</span>
              </p>
            </div>

            <TimerBadge seconds={600} onDone={() => setPaused(true)} running={!paused} />

            <button
              type="button"
              onClick={togglePause}
              aria-pressed={paused}
              aria-label={paused ? "Resume" : "Pause"}
              title={paused ? "Resume" : "Pause"}
              className={`inline-flex items-center justify-center rounded-full border border-border p-2
                          hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring
                          ${paused ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700" : ""}`}
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Blocking overlay when paused */}
      {paused && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="paused-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="mx-4 max-w-md rounded-2xl bg-card text-card-foreground p-6 shadow-xl border border-border">
            <h2 id="paused-title" className="text-lg font-semibold">
              Paused
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">You can’t edit until you resume.</p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                ref={resumeBtnRef}
                onClick={() => setPaused(false)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-2 py-1 text-sm font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Play className="h-3 w-3" /> Resume
              </button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground text-center">
              Tip: Press{" "}
              <kbd className="rounded border border-border bg-muted px-1">Space</kbd> or{" "}
              <kbd className="rounded border border-border bg-muted px-1">Esc</kbd> to resume.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
