"use client";

import { TimerBadge } from "@/components/shadcn_ui/timer";
import { Bug, FileText, Moon, Pause, Play, Sun } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const hasDark = document.documentElement.classList.contains("dark");
    // TODO
    setDark(hasDark);
  }, []);

  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 p-1.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
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
  trial: number;
}

export default function Header({ workflow, trial }: HeaderProps) {
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
      <header className="relative w-full bg-[var(--purple)] text-white py-2">
        {/* Right utilities (absolute) */}
        <div className="absolute right-4 top-3/4 -translate-y-1/2 flex items-center gap-2">
          {/* Version badge (from env) */}
          {process.env.NEXT_PUBLIC_APP_TAG && (
            <span className="hidden sm:inline rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs">
        {process.env.NEXT_PUBLIC_APP_TAG}
      </span>
          )}

          {/* Docs */}
          <Link
            href="https://github.com/arianneroselina/human-ai-cocreativity#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            title="Open README"
            aria-label="Open README"
          >
            <FileText className="h-3.5 w-3.5" />
            Docs
          </Link>

          {/* Report issue */}
          <Link
            href="https://github.com/arianneroselina/human-ai-cocreativity/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            title="Report an issue"
            aria-label="Report an issue"
          >
            <Bug className="h-3.5 w-3.5" />
            Issue
          </Link>

          {/* GitHub icon */}
          <Link
            href="https://github.com/arianneroselina/human-ai-cocreativity"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            title="View source on GitHub"
            aria-label="View source on GitHub"
          >
            <Image src="/github_dark.png" alt="Github" width="16" height="16" className="object-contain"/>
            Github
          </Link>

          {/* Theme toggle */}
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
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Human-AI Co-Creativity
            </h1>
            <p className="mt-1 text-sm text-gray-200">Experimental study interface</p>
          </div>
        </div>
      </header>

      {/* Only show the Trial, Timer, and Progress after the trial has started */}
      {trial > 0 && (
        <div className="border-b bg-white/90">
          <div className="mx-auto max-w-4xl p-4 flex items-center gap-3">
            <div className="mr-auto">
              <h1 className="text-xl font-semibold tracking-tight">Human-AI Co-Creativity</h1>
              <p className="text-xs text-gray-500">
                Trial {trial}: <span className="font-medium text-gray-800">{workflow}</span>
              </p>
            </div>

            {/* Timer */}
            <TimerBadge seconds={600} onDone={() => setPaused(true)} running={!paused} />

            {/* Icon button: Pause/Resume */}
            <button
              type="button"
              onClick={togglePause}
              aria-pressed={paused}
              aria-label={paused ? "Resume" : "Pause"}
              title={paused ? "Resume" : "Pause"}
              className={`inline-flex items-center justify-center rounded-full border p-2
                        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20
                        ${paused ? "bg-yellow-50 border-yellow-300" : ""}`}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="paused-title" className="text-lg font-semibold">
              Paused
            </h2>
            <p className="mt-2 text-sm text-gray-600">You can’t edit until you resume.</p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                ref={resumeBtnRef}
                onClick={() => setPaused(false)}
                className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                <Play className="h-3 w-3" /> Resume
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500 text-center">
              Tip: Press <kbd className="rounded border bg-gray-50 px-1">Space</kbd> or{" "}
              <kbd className="rounded border bg-gray-50 px-1">Esc</kbd> to resume.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
