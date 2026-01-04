"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

  const router = useRouter();
  const { run, send } = useExperiment();

  const [loading, setLoading] = useState(false);

  const [ageGroup, setAgeGroup] = useState<string>("");
  const [gender, setGender] = useState<Gender | "">("");

  const [regionDE, setRegionDE] = useState<string>("");
  const [education, setEducation] = useState<Education | "">("");

  const [nativeLang, setNativeLang] = useState<string>("");
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel | "">("");

  const [writingConfidence, setWritingConfidence] = useState<Likert | null>(null);
  const [aiFamiliarity, setAiFamiliarity] = useState<Likert | null>(null);
  const [aiAttitude, setAiAttitude] = useState<Likert | null>(null);

  const [comment, setComment] = useState("");
  const MAX_COMMENT_CHARS = 200;
  const commentChars = useMemo(() => comment.length, [comment]);

  const germanStates = useMemo(() => getGermanStates(), []);

  const canSubmit =
    ageGroup.trim().length > 0 &&
    gender !== "" &&
    regionDE !== "" &&
    education !== "" &&
    nativeLang.trim().length > 0 &&
    englishLevel !== "" &&
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
        gender,
        regionDE,
        education,
        nativeLang,
        englishLevel,
        writingConfidence,
        aiFamiliarity,
        aiAttitude,
        comment,
      }),
    });

    send({ type: "FINISH_PREQUESTIONNAIRE" } as any);
    router.replace("/tutorial");
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

            <div className="flex-1">
              <h2 className="text-2xl font-semibold tracking-tight">Pre-questionnaire</h2>
              <p className="mt-1 text-sm text-muted-foreground">A few quick questions before we begin.</p>

              <div className="mt-5 space-y-5">
                {/* 1) Age group */}
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

                {/* 2) Gender */}
                <div className="space-y-2">
                  <label className="block text-sm text-foreground">2) Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                {/* 3) Region in Germany */}
                <div className="space-y-2">
                  <label className="block text-sm text-foreground">3) Region (Germany)</label>
                  <select
                    value={regionDE}
                    onChange={(e) => setRegionDE(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    <option value="not_in_germany">Not in Germany</option>
                    {germanStates.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name}
                      </option>
                    ))}
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                {/* 4) Highest education level */}
                <div className="space-y-2">
                  <label className="block text-sm text-foreground">4) Highest education level</label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value as any)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    <option value="secondary">Secondary school</option>
                    <option value="bachelor">Bachelor</option>
                    <option value="master">Master</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                {/* 5) Native language */}
                <div className="space-y-2">
                  <label className="block text-sm text-foreground">5) Native language</label>
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
                </div>

                {/* 6) English proficiency (select) */}
                <div className="space-y-2">
                  <label className="block text-sm text-foreground">6) English proficiency</label>
                  <select
                    value={englishLevel}
                    onChange={(e) => setEnglishLevel(e.target.value as any)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground
                               focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Select…
                    </option>
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

                {/* 7) Writing confidence */}
                <LikertRow
                  label="7) I feel confident writing short texts under time pressure."
                  value={writingConfidence}
                  onChange={setWritingConfidence}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />

                {/* 8) AI familiarity */}
                <LikertRow
                  label="8) I am familiar with AI writing tools (e.g., ChatGPT, Copilot)."
                  value={aiFamiliarity}
                  onChange={setAiFamiliarity}
                  left="Strongly Disagree"
                  right="Strongly Agree"
                />

                {/* 9) AI attitude */}
                <LikertRow
                  label="9) I generally have a positive attitude toward using AI for writing support."
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
