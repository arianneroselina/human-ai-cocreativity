"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/stores/useExperiment";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { Button } from "@/components/shadcn_ui/button";
import ISO6391 from "iso-639-1";
import LikertRow, { Likert } from "@/components/ui/likertRow";
import { Textarea } from "@/components/shadcn_ui/textarea";
import { ClipboardList, Loader2 } from "lucide-react";

export default function PreQuestionnaire() {
  useRouteGuard(["pre-questionnaire"]);

  const router = useRouter();
  const { run, send } = useExperiment();

  const [loading, setLoading] = useState(false);

  const [ageGroup, setAgeGroup] = useState<string>("");
  const [nativeLang, setNativeLang] = useState<string>("");

  const [writingConfidence, setWritingConfidence] = useState<Likert | null>(null);
  const [aiFamiliarity, setAiFamiliarity] = useState<Likert | null>(null);
  const [aiAttitude, setAiAttitude] = useState<Likert | null>(null);

  const [comment, setComment] = useState("");
  const MAX_COMMENT_CHARS = 200;
  const commentChars = useMemo(() => comment.length, [comment]);

  const canSubmit =
    ageGroup.trim().length > 0 &&
    nativeLang.trim().length > 0 &&
    writingConfidence !== null &&
    aiFamiliarity !== null &&
    aiAttitude !== null;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);

    const { run } = useExperiment.getState();

    await fetch("/api/pre-questionnaire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: run.participantId,
        sessionId: run.sessionId,
        ageGroup,
        nativeLang,
        writingConfidence,
        aiFamiliarity,
        aiAttitude,
        comment,
      }),
    });

    console.log("Pre-questionnaire submitted:", {
      participantId: run.participantId,
      sessionId: run.sessionId,
      ageGroup,
      nativeLang,
      writingConfidence,
      aiFamiliarity,
      aiAttitude,
      comment,
    });

    send({ type: "FINISH_PREQUESTIONNAIRE" } as any);
    router.replace("/choose");
  };

  const languageOptions = useMemo(() => {
    const dn =
      typeof Intl !== "undefined" && "DisplayNames" in Intl
        ? new (Intl as any).DisplayNames(["en"], { type: "language" })
        : null;

    const opts = ISO6391.getAllCodes()
      .map((code) => {
        const name =
          (dn?.of?.(code) as string | undefined) || ISO6391.getName(code) || code;
        return { code, name };
      })
      .filter((x) => x.name && x.name !== x.code);

    // sort by name
    opts.sort((a, b) => a.name.localeCompare(b.name));
    return opts;
  }, []);

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl p-6">
        <section className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <ClipboardList className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-semibold tracking-tight">Pre-questionnaire</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A few quick questions before we begin the study.
              </p>

              <div className="mt-5 space-y-5">
                {/* Age group */}
                <div className="space-y-2">
                  <label className="block text-sm text-foreground">1) Age group</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    <option value="18-24">18–24</option>
                    <option value="25-34">25–34</option>
                    <option value="35-44">35–44</option>
                    <option value="45+">45+</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                {/* Native language */}
                <div className="space-y-2">
                  <label className="block text-sm text-foreground">
                    2) Native language
                  </label>

                  <select
                    value={nativeLang}
                    onChange={(e) => setNativeLang(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
               focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Select…
                    </option>

                    {languageOptions.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name}
                      </option>
                    ))}
                  </select>

                  <p className="text-xs text-muted-foreground">
                    If your language isn’t listed, choose the closest option.
                  </p>
                </div>

                {/* Likert questions */}
                <LikertRow
                  label="3) I feel confident writing short texts under time pressure."
                  value={writingConfidence}
                  onChange={setWritingConfidence}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />

                <LikertRow
                  label="4) I am familiar with AI writing tools (e.g., ChatGPT, Copilot)."
                  value={aiFamiliarity}
                  onChange={setAiFamiliarity}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />

                <LikertRow
                  label="5) I generally have a positive attitude toward using AI for writing support."
                  value={aiAttitude}
                  onChange={setAiAttitude}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />

                {/* Optional comment */}
                <div className="space-y-2">
                  <label htmlFor="comment" className="block text-sm text-foreground">
                    Optional short comment
                  </label>

                  <Textarea
                    id="comment"
                    rows={2}
                    maxLength={MAX_COMMENT_CHARS}
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_CHARS))}
                    placeholder="Anything we should know before you start?"
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />

                  <div className="flex justify-end">
                    <span
                      className={`text-xs ${
                        commentChars >= MAX_COMMENT_CHARS ? "text-red-500" : "text-muted-foreground"
                      }`}
                      aria-live="polite"
                      role="status"
                    >
                      {commentChars}/{MAX_COMMENT_CHARS}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                  className="inline-flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
