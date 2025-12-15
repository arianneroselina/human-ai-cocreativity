"use client";

import { Button } from "@/components/shadcn_ui/button";
import { FC, useEffect, useRef, useState } from "react";

type ConsentModalProps = {
  onConsent: (consent: boolean) => void;
};

const ConsentModal: FC<ConsentModalProps> = ({ onConsent }) => {
  const [hasUnlockedAgree, setHasUnlockedAgree] = useState(false);
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
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Informed Consent"
    >
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold">Informed Consent Form</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please read the following information carefully.
        </p>

        {/* Scrollable consent text */}
        <div
          ref={scrollContainerRef}
          onScroll={checkAndUnlock}
          className="mt-4 h-[60vh] overflow-auto rounded border border-gray-300 p-4 text-sm space-y-6"
        >
          <section>
            <h3 className="font-semibold text-base">1. Purpose of the Study</h3>
            <p>
              You are invited to take part in a research study exploring how people collaborate with artificial intelligence (AI)
              on time‑boxed writing tasks. During the study, you will engage in several rounds of writing tasks using different
              collaboration workflows. We want to understand how different forms of collaboration with AI influence writing efficiency,
              output quality, workflow choice, and trust in AI.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base">2. Participation Requirements</h3>
            <p>
              Participation is voluntary. You must be at least 18 years old and able to read English. If you choose to participate,
              you will complete a session consisting of three time‑bounded writing rounds. Each round uses one of several collaboration
              workflows (e.g., human only, AI only, mixed).
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base">3. Procedures</h3>
            <p>
              - You will start a session by clicking “Start session”.<br />
              - Each of the 3 rounds is time‑boxed; you should submit before time runs out.<br />
              - In each round you will select one of the provided collaboration workflows and complete a writing task.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base">4. Duration and Tasks</h3>
            <p>
              The entire session will take approximately <strong>20–30 minutes</strong>. During each round, you will choose a workflow
              and complete the associated writing task.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base">5. What Will Be Recorded</h3>
            <p>
              The following information will be recorded <strong>anonymously</strong> for research purposes:<br />
              - Task duration and timing<br />
              - The workflow you select each round<br />
              - The final text output you submit after each round<br />
              No personal identifying information (e.g., name, email) is collected.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base">6. Risks and Discomforts</h3>
            <p>
              There are no known risks beyond those experienced in normal computer use. You may skip any task or withdraw from
              the study at any time without penalty. Participation is voluntary.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base">7. Confidentiality</h3>
            <p>
              No personal data will be collected. All responses and outputs are stored anonymously. Data will be handled in
              accordance with GDPR‑aligned data protection standards.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base">8. Voluntary Participation and Withdrawal</h3>
            <p>
              Your participation is voluntary. You may refuse to participate or withdraw at any time without penalty. If you decide
              to withdraw, your data from this session will not be used.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base">9. Consent</h3>
            <p>
              By clicking “Agree,” you confirm that you have read the information provided above, you understand the purpose and
              procedures of the study, and you voluntarily agree to participate.
            </p>
          </section>
        </div>

        <div className="mt-4 flex justify-between gap-4">
          <Button
            variant="secondary"
            onClick={() => onConsent(false)}
            className="w-32"
          >
            Decline
          </Button>

          <Button
            onClick={() => onConsent(true)}
            className="w-32"
            disabled={!hasUnlockedAgree}
          >
            Agree
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
