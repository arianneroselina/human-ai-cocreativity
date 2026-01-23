"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/shadcn_ui/button";
import { Textarea } from "@/components/shadcn_ui/textarea";
import ConfirmDialog from "@/components/ui/confirm";
import { Loader2, Sparkles, MessageSquareText, CheckCircle2 } from "lucide-react";
import { Workflow } from "@/lib/experiment";

type ChatMsg = { role: "user" | "assistant"; content: string };

type Props = {
  mode: Workflow;
  aiLocked: boolean;
  onLockAi?: () => void;
  onUnlockAi?: () => void;
  onDraft: (draftText: string) => void;
  baseHumanText?: string;
  storageKey?: string;
  defaultOpen?: boolean;
};

const WIDTH_STORAGE_KEY = "ai_chat_width";
const DEFAULT_W = 340;
const MIN_W = 300;
const MAX_W = 780;

const HEIGHT_STORAGE_KEY = "ai_chat_height";
const DEFAULT_H = 520;
const MIN_H = 360;
const MAX_H = 780;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function clampHistory(msgs: ChatMsg[], maxPairs: number) {
  const max = Math.max(0, maxPairs * 2);
  if (msgs.length <= max) return msgs;
  return msgs.slice(msgs.length - max);
}

export default function AiChatBox({
                                    mode,
                                    aiLocked,
                                    onLockAi,
                                    onUnlockAi,
                                    onDraft,
                                    baseHumanText,
                                    storageKey,
                                    defaultOpen = true,
                                  }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedAssistantIndex, setSelectedAssistantIndex] = useState<number | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* ------------------------------------------------------------
   * Open AI chat automatically
   * ------------------------------------------------------------ */
  useEffect(() => {
    const openChat = () => setOpen(true);
    document.addEventListener("open-ai-chat", openChat);
    return () => document.removeEventListener("open-ai-chat", openChat);
  }, []);

  /* ------------------------------------------------------------
   * Draft mirroring (while AI is locked)
   * ------------------------------------------------------------ */
  useEffect(() => {
    if (mode !== "human_ai") return;
    if (!aiLocked) return;

    const text = baseHumanText?.trim() ?? "";
    if (!text) return;

    setMessages((prev) => {
      if (!text) return prev;

      // no messages yet -> create base user message
      if (prev.length === 0) {
        return [{ role: "user", content: text }];
      }

      // first message is not user -> insert
      if (prev[0].role !== "user") {
        return [{ role: "user", content: text }, ...prev];
      }

      // first user message already matches -> do nothing
      if (prev[0].content === text) {
        return prev;
      }

      return [{ ...prev[0], content: text }];
    });
  }, [mode, baseHumanText, aiLocked]);

  /* ------------------------------------------------------------
   * Autosave chat (after AI unlock)
   * ------------------------------------------------------------ */
  useEffect(() => {
    if (!storageKey) return;
    if (aiLocked) return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.messages)) {
        setMessages(parsed.messages);
      }
      if (typeof parsed.selectedAssistantIndex === "number") {
        setSelectedAssistantIndex(parsed.selectedAssistantIndex);
      }
    } catch {
      // ignore corrupt storage
    }
  }, [storageKey, aiLocked]);

  useEffect(() => {
    if (!storageKey) return;
    if (aiLocked) return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          messages,
          selectedAssistantIndex,
        })
      );
    } catch {}
  }, [messages, selectedAssistantIndex, storageKey, aiLocked]);

  /* ------------------------------------------------------------
   * Adjustable size
   * ------------------------------------------------------------ */
  const [panelWidth, setPanelWidth] = useState<number>(DEFAULT_W);
  const [panelHeight, setPanelHeight] = useState<number>(DEFAULT_H);

  const resizeModeRef = useRef<null | "w" | "h" | "wh">(null);

  const startXRef = useRef(0);
  const startYRef = useRef(0);

  const startWRef = useRef(DEFAULT_W);
  const startHRef = useRef(DEFAULT_H);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WIDTH_STORAGE_KEY);
      if (raw) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) setPanelWidth(clamp(parsed, MIN_W, MAX_W));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(WIDTH_STORAGE_KEY, String(panelWidth));
    } catch {}
  }, [panelWidth]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HEIGHT_STORAGE_KEY);
      if (raw) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) setPanelHeight(clamp(parsed, MIN_H, MAX_H));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(HEIGHT_STORAGE_KEY, String(panelHeight));
    } catch {}
  }, [panelHeight]);

  const onResizeWidthStart = (e: React.MouseEvent) => {
    resizeModeRef.current = "w";
    startXRef.current = e.clientX;
    startWRef.current = panelWidth;
    e.preventDefault();
    e.stopPropagation();
  };

  const onResizeHeightStart = (e: React.MouseEvent) => {
    resizeModeRef.current = "h";
    startYRef.current = e.clientY;
    startHRef.current = panelHeight;
    e.preventDefault();
    e.stopPropagation();
  };

  const onResizeCornerStart = (e: React.MouseEvent) => {
    resizeModeRef.current = "wh";
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startWRef.current = panelWidth;
    startHRef.current = panelHeight;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const mode = resizeModeRef.current;
      if (!mode) return;

      // keep within viewport bounds too
      const maxW = Math.min(MAX_W, window.innerWidth - 24);
      const maxH = Math.min(MAX_H, window.innerHeight - 24);

      if (mode === "w" || mode === "wh") {
        const dx = e.clientX - startXRef.current;
        const nextW = clamp(startWRef.current - dx, MIN_W, maxW);
        setPanelWidth(nextW);
      }

      if (mode === "h" || mode === "wh") {
        const dy = e.clientY - startYRef.current;
        const nextH = clamp(startHRef.current - dy, MIN_H, maxH);
        setPanelHeight(nextH);
      }
    };

    const onUp = () => {
      resizeModeRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [panelWidth, panelHeight]);

  /* ------------------------------------------------------------
   * Scroll behavior
   * ------------------------------------------------------------ */
  // on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // on open
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    });
  }, [open]);

  /* ------------------------------------------------------------
   * Sending messages
   * ------------------------------------------------------------ */
  const canSend = useMemo(
    () => !aiLocked && !loading && !!prompt.trim(),
    [aiLocked, loading, prompt]
  );

  const send = async () => {
    if (!canSend) return;

    const userMsg = prompt.trim();
    setPrompt("");
    setLoading(true);

    const historyBefore = messages;
    setMessages((m) => [...m, { role: "user", content: userMsg }]);

    const input = buildInput(userMsg, historyBefore);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input, history: historyBefore }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("AI error", err);
        alert("AI request failed. Please try again.");
        return;
      }

      const data = await res.json();
      const aiText = (data?.text ?? "").trim();
      setMessages((m) => [...m, { role: "assistant", content: aiText }]);
    } finally {
      setLoading(false);
    }
  };

  const buildInput = (userMsg: string, history: ChatMsg[]) => {
    const trimmedHistory = clampHistory(history, 6);
    const historyBlock =
      trimmedHistory.length === 0
        ? "none"
        : trimmedHistory
          .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
          .join("\n");

    return [
      `CHAT HISTORY (for context):`,
      historyBlock,
      ``,
      `USER REQUEST:`,
      userMsg,
    ].join("\n");
  };

  /* ------------------------------------------------------------
   * Draft selection
   * ------------------------------------------------------------ */
  const selectAsDraft = (idx: number, content: string) => {
    setSelectedAssistantIndex(idx);
    onDraft(content);
  };

  /* ------------------------------------------------------------
   * Clear chat
   * ------------------------------------------------------------ */
  const clearChat = () => {
    setMessages([]);
    setPrompt("");
    setSelectedAssistantIndex(null);

    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  /* ------------------------------------------------------------
   * Block copy/paste
   * ------------------------------------------------------------ */
  const [showMessage, setShowMessage] = useState(false);
  const handleCopyPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };

  /* ------------------------------------------------------------
   * Lock/unlock AI
   * ------------------------------------------------------------ */
  const lockAi = () => {
    setOpen(false);
    if (onLockAi) {
      onLockAi();
    }
  };

  const unlockAi = () => {
    setOpen(true);
    if (onUnlockAi) {
      onUnlockAi();
    }
  };

  const isAiOnly = mode === "ai";
  const isAiToHuman = mode === "ai_human";
  const isHumanToAi = mode === "human_ai";

  const assistantCount = messages.filter((m) => m.role === "assistant").length;
  const hasSelection = selectedAssistantIndex !== null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        {/* Collapsed pill */}
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={isHumanToAi && aiLocked}
            className={[
              "group relative flex items-center gap-2 rounded-full px-4 py-3 shadow-2xl border border-border/60",
              "bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50 text-primary-foreground",
              !aiLocked ? "hover:from-primary hover:via-primary/80 hover:to-primary/60 transition-all" : "",
              aiLocked ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
            aria-label="Open AI chat"
          >
            <div className="relative">
              <Sparkles className="h-4 w-4 opacity-95" />
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-sm font-semibold">AI Chat</span>
            </div>

            {/* badge */}
            <div className="ml-2 flex items-center gap-2">
              {hasSelection && (
                <div className="relative">
                  <CheckCircle2 className="h-4 w-4 opacity-95" />
                  <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2
                    whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white
                    opacity-0 transition-opacity group-hover:opacity-100">
                    Selection detected
                  </span>
                </div>
              )}

              {assistantCount > 0 && (
                <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-medium">
                  {assistantCount}
                </span>
              )}

              <span className="ml-1 text-[11px] opacity-80 group-hover:opacity-100">
                Open
              </span>
            </div>
          </button>
        )}

        {/* Expanded panel */}
        {open && (
          <div
            className={[
              "group relative overflow-hidden rounded-2xl shadow-2xl",
              "border border-border/70",
              "ring-1 ring-primary/25",
              "bg-gradient-to-b from-card via-card to-primary/5",
              "backdrop-blur",
              "flex flex-col",
            ].join(" ")}
            style={{ width: panelWidth, height: panelHeight }}
          >

            {/* Left-edge width handle */}
            <div
              onMouseDown={onResizeWidthStart}
              className="absolute left-0 top-0 h-full w-2 cursor-ew-resize select-none bg-transparent"
              aria-label="Resize chat width"
              title="Drag to resize width"
            />

            {/* Top-left corner handle (width + height together) */}
            <div
              onMouseDown={onResizeCornerStart}
              className="absolute left-0 top-0 h-3 w-3 cursor-nwse-resize select-none bg-transparent"
              aria-label="Resize chat size"
              title="Drag to resize width + height"
            />

            {/* Top-edge height handle (optional, keeps height-only resizing easy) */}
            <div
              onMouseDown={onResizeHeightStart}
              className="absolute left-3 top-0 h-2 w-[calc(100%-12px)] cursor-ns-resize select-none bg-transparent"
              aria-label="Resize chat height"
              title="Drag to resize height"
            />

            {/* Header */}
            <div className="border-b border-border/70 bg-gradient-to-r from-primary/15 via-card to-primary/5 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 mt-1">
                  <MessageSquareText className="h-4 w-4 text-foreground/80" />
                  <div className="text-sm font-semibold text-foreground">AI Assistant</div>
                  {hasSelection && (
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      Draft selected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setClearOpen(true)}
                    disabled={aiLocked || (messages.length === 0 && !prompt)}
                  >
                    Clear
                  </Button>

                  {!isAiOnly && (
                    <>
                      {isAiToHuman && !aiLocked && (
                        <Button
                          size="sm"
                          onClick={() => setLockOpen(true)}
                          className={hasSelection ? "animate-pulse" : ""}
                        >
                          Lock AI
                        </Button>
                      )}

                      {isHumanToAi && aiLocked && (
                        <Button size="sm" onClick={() => setUnlockOpen(true)}>
                          Unlock AI
                        </Button>
                      )}
                    </>
                  )}

                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Collapse chat">
                    ✕
                  </Button>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border/60 bg-muted/40">
              <strong className="text-foreground">⚠️ Disclaimer:</strong>{" "}
              {isHumanToAi ? (
                <>
                  The AI receives <strong>your draft text</strong> as context, but does{" "}
                  <strong>not</strong> know the task, rules, or any other context.
                </>
              ) : (
                <>
                  The AI does <strong>not</strong> know the task, rules, or any other context.
                </>
              )}
            </div>

            {/* Body */}
            <div className="p-3 flex flex-1 min-h-0 flex-col">
              <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-border bg-background/60 p-2">
                {messages.length === 0 && !aiLocked ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                    No messages yet.

                    {isHumanToAi && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setMessages([{ role: "user", content: baseHumanText ?? "" }])
                        }
                        disabled={!baseHumanText}
                      >
                        Start with current draft
                      </Button>
                    )}
                  </div>
                )
                : (
                  <div className="space-y-3 p-1">
                    {messages.map((m, idx) => {
                      const isAssistant = m.role === "assistant";
                      const isSelected = isAssistant && selectedAssistantIndex === idx;

                      return (
                        <div
                          key={idx}
                          className={[
                            "flex",
                            isAssistant ? "justify-start" : "justify-end",
                          ].join(" ")}
                        >
                          <div className={isAssistant ? "max-w-[88%]" : "max-w-[88%]"}>
                            <div className="mb-1 text-[11px] text-muted-foreground">
                              {isAssistant ? "AI" : "You"}
                              {isSelected ? " • selected" : ""}
                            </div>

                            <div
                              className={[
                                "whitespace-pre-wrap rounded-xl border border-border px-3 py-2 text-sm",
                                isAssistant
                                  ? isSelected
                                    ? "bg-primary/10"
                                    : "bg-card"
                                  : "bg-primary/15 border-primary/25",
                              ].join(" ")}
                            >
                              {m.content}
                            </div>

                            {isAssistant && (
                              <div className="mt-2 flex justify-end">
                                  <Button
                                  variant={isSelected ? "selected" : "secondary"}
                                  size="sm"
                                  onClick={() => selectAsDraft(idx, m.content)}
                                  disabled={aiLocked}
                                >
                                  {isSelected ? "Selected draft" : "Use as draft"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Prompt */}
              <div className="mt-3 relative">
                <Textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    aiLocked
                      ? "Locked."
                      : "Type something..."
                  }
                  readOnly={aiLocked || loading}
                  onCopy={handleCopyPaste}
                  onPaste={handleCopyPaste}
                  onCut={handleCopyPaste}
                  className={[
                    aiLocked ? "bg-muted" : "bg-background",
                    "text-foreground placeholder:text-muted-foreground",
                    "rounded-xl",
                  ].join(" ")}
                />

                {showMessage && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mt-1 mb-1 bg-black text-white text-xs p-2 rounded-md shadow-md opacity-60 text-center w-auto max-w-xs">
                    Copy, paste, and cut are disabled for this field.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  {aiLocked
                    ? isHumanToAi
                      ? "Create a draft first, then unlock AI."
                      : "AI locked. Human can edit now."
                    : loading
                      ? "AI is writing..."
                      : "Ask AI, then choose a response."}
                </div>

                <Button onClick={send} disabled={!canSend}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Send
                    </>
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
            </div>

            {/* subtle corner accent */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear chat?"
        description="This will remove all chat messages."
        confirmLabel="Clear"
        cancelLabel="Cancel"
        onConfirm={clearChat}
      />

      <ConfirmDialog
        open={lockOpen}
        onOpenChange={setLockOpen}
        title="Lock AI?"
        description="You won't be able to ask the AI again."
        confirmLabel="Lock AI"
        cancelLabel="Cancel"
        onConfirm={lockAi}
      />

      <ConfirmDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        title="Unlock AI?"
        description="You won't be able to edit your draft manually anymore."
        confirmLabel="Unlock AI"
        cancelLabel="Cancel"
        onConfirm={unlockAi}
      />
    </>
  );
}
