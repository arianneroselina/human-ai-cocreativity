"use client";

import { Button } from "@/components/shadcn_ui/button";
import { FC, useEffect, useRef, useState } from "react";
import { useExperiment } from "@/stores/useExperiment";
import { CONSENT_SECTIONS, CONSENT_VERSION, buildConsentText } from "@/data/consent";

type ConsentModalProps = {
  onConsent: (consent: boolean) => void;
};

const ConsentModal: FC<ConsentModalProps> = ({ onConsent }) => {
  const { run } = useExperiment();

  const [hasUnlockedAgree, setHasUnlockedAgree] = useState(false);
  const [saving, setSaving] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const unlockedRef = useRef(false);

  const checkAndUnlock = () => {
    if (unlockedRef.current) return;

    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;

    // If content fits without scrolling, unlock immediately.
    if (scrollHeight <= clientHeight + 1) {
      unlockedRef.current = true;
      setHasUnlockedAgree(true);
      return;
    }

    // Unlock once the user reaches the bottom
    if (scrollTop + clientHeight >= scrollHeight - 2) {
      unlockedRef.current = true;
      setHasUnlockedAgree(true);
    }
  };

  useEffect(() => {
    checkAndUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistConsent = async (consented: boolean) => {
    if (!run.participantId || !run.sessionId) return;

    await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: run.participantId,
        sessionId: run.sessionId,
        consented,
        version: CONSENT_VERSION,
        consentText: buildConsentText(),
      }),
    });

    console.log("Consent submitted:", {
      participantId: run.participantId,
      sessionId: run.sessionId,
      version: CONSENT_VERSION,
      consentText: buildConsentText(),
    });
  };

  const onAgree = async () => {
    try {
      setSaving(true);
      await persistConsent(true);
      onConsent(true);
    } catch {
      alert("Could not save consent. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onClose = () => {
    onConsent(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Informed Consent"
    >
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold">Informed Consent Form</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please read the following information carefully.
        </p>

        <div
          ref={scrollContainerRef}
          onScroll={checkAndUnlock}
          className="mt-4 h-[60vh] overflow-auto rounded border border-gray-300 p-4 text-sm space-y-6"
        >
          {CONSENT_SECTIONS.map((s) => (
            <section key={s.title}>
              <h3 className="font-semibold text-base">{s.title}</h3>
              <p className="whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onAgree} className="w-32" disabled={!hasUnlockedAgree || saving}>
            Agree
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
