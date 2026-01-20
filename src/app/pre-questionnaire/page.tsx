"use client";

import { useMemo, useState } from "react";
import { useExperiment } from "@/stores/useExperiment";
import { getGermanStates } from "@/lib/deRegions";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { Button } from "@/components/shadcn_ui/button";
import ISO6391 from "iso-639-1";
import LikertRow, { Likert } from "@/components/ui/likertRow";
import { Textarea } from "@/components/shadcn_ui/textarea";
import { ClipboardList, Loader2 } from "lucide-react";

type Gender = "female" | "male" | "prefer_not_to_say";
type Education = "secondary" | "bachelor" | "master" | "phd" | "other" | "prefer_not_to_say";
type EnglishLevel = "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | "native" | "prefer_not_to_say";

export default function PreQuestionnaire() {
  useRouteGuard(["pre-questionnaire"]);
  const { run, send } = useExperiment();

  const [loading, setLoading] = useState(false);

  // personal info
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<Gender | "">("");
  const [regionDE, setRegionDE] = useState("");
  const [education, setEducation] = useState<Education | "">("");
  const [nativeLang, setNativeLang] = useState("");
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel | "">("");
  const [writingConfidence, setWritingConfidence] = useState<Likert | null>(null);

  const [aiasLife, setAiasLife] = useState<Likert | null>(null);
  const [aiasWork, setAiasWork] = useState<Likert | null>(null);
  const [aiasFutureUse, setAiasFutureUse] = useState<Likert | null>(null);
  const [aiasHumanity, setAiasHumanity] = useState<Likert | null>(null);

  // comment
  const [comment, setComment] = useState("");
  const MAX_COMMENT_CHARS = 200;
  const commentChars = useMemo(() => comment.length, [comment]);

  const germanStates = useMemo(() => getGermanStates(), []);

  const canSubmit =
    age !== "" &&
    age >= 18 &&
    age <= 120 &&
    gender &&
    regionDE &&
    education &&
    nativeLang &&
    englishLevel &&
    writingConfidence !== null &&
    aiasLife !== null &&
    aiasWork !== null &&
    aiasFutureUse !== null &&
    aiasHumanity !== null;

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
        age,
        gender,
        regionDE,
        education,
        nativeLang,
        englishLevel,
        writingConfidence,
        aiasLife,
        aiasWork,
        aiasFutureUse,
        aiasHumanity,
        comment,
      }),
    });

    console.log("Pre-questionnaire submitted:", {
      participantId: run.participantId,
      sessionId: run.sessionId,
      age,
      gender,
      regionDE,
      education,
      nativeLang,
      englishLevel,
      writingConfidence,
      aiasLife,
      aiasWork,
      aiasFutureUse,
      aiasHumanity,
      comment,
    });

    send({ type: "FINISH_PREQUESTIONNAIRE" } as any);
    setLoading(false);
  };

  const languageOptions = useMemo(() => {
    const dn =
      typeof Intl !== "undefined" && "DisplayNames" in Intl
        ? new (Intl as any).DisplayNames(["en"], { type: "language" })
        : null;

    const opts = ISO6391.getAllCodes()
      .map((code) => {
        const name = (dn?.of?.(code) as string | undefined) || ISO6391.getName(code) || code;
        return { code, name };
      })
      .filter((x) => x.name && x.name !== x.code);

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

            <div className="flex-1 space-y-8">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Pre-questionnaire</h2>
                <p className="mt-1 text-sm text-muted-foreground">A few quick questions before we begin.</p>
              </div>

              {/* -------- Section 1 -------- */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold">Personal information</h3>

                <div className="space-y-1">
                  <label className="text-sm text-foreground">Age</label>
                  <input
                    type="number"
                    min={18}
                    max={120}
                    value={age}
                    onChange={(e) =>
                      setAge(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="Enter your age"
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-foreground">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>Select gender…</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-foreground">Region</label>
                  <select
                    value={regionDE}
                    onChange={(e) => setRegionDE(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>Select…</option>
                    <option value="not_in_germany">Not in Germany</option>
                    {germanStates.map((r) => (
                      <option key={r.code} value={r.code}>{r.name}</option>
                    ))}
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-foreground">Education</label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value as any)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>Select…</option>
                    <option value="secondary">Secondary school</option>
                    <option value="bachelor">Bachelor</option>
                    <option value="master">Master</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-foreground">Language</label>
                  <select
                    value={nativeLang}
                    onChange={(e) => setNativeLang(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>Select…</option>
                    {languageOptions.map((l) => (
                      <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-foreground">English</label>
                  <select
                    value={englishLevel}
                    onChange={(e) => setEnglishLevel(e.target.value as any)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>Select…</option>
                    <option value="a1">A1 (Beginner)</option>
                    <option value="a2">A2 (Elementary)</option>
                    <option value="b1">B1 (Intermediate)</option>
                    <option value="b2">B2 (Upper-intermediate)</option>
                    <option value="c1">C1 (Advanced)</option>
                    <option value="c2">C2 (Proficient)</option>
                    <option value="native">Native / near-native</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <LikertRow
                  label="I feel confident writing short texts under time pressure."
                  value={writingConfidence}
                  onChange={setWritingConfidence}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />
              </div>

              <div className="space-y-5">
                <h3 className="text-lg font-semibold">Attitudes toward Artificial Intelligence</h3>

                <LikertRow label="AI will improve my life." value={aiasLife} onChange={setAiasLife} />
                <LikertRow label="AI will improve my work." value={aiasWork} onChange={setAiasWork} />
                <LikertRow label="I will use AI technology in the future." value={aiasFutureUse} onChange={setAiasFutureUse} />
                <LikertRow label="AI technology is positive for humanity." value={aiasHumanity} onChange={setAiasHumanity} />
              </div>

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
