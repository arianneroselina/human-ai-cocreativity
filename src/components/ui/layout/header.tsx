"use client";

import { Bug, FileText, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
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
      className="inline-flex items-center justify-center rounded-md border border-white/25 bg-white/10 p-1.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      type="button"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export default function Header() {
  return (
    <>
      <header data-app-header className="relative w-full bg-primary text-white py-2">
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
            <Image
              src="/github_dark.png"
              alt="Github"
              width="16"
              height="16"
              className="object-contain"
            />
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
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Human-AI Co-Creativity
            </h1>
            <p className="mt-1 text-sm text-white/80">Experimental study interface</p>
          </div>
        </div>
      </header>
    </>
  );
}
