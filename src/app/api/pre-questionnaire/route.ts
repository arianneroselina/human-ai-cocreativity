import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const isLikert = (v: unknown) =>
  Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5;

const isAge = (v: unknown) =>
  Number.isInteger(v) && (v as number) >= 18 && (v as number) <= 120;

const GENDERS = new Set(["female", "male", "prefer_not_to_say"]);
const EDUCATIONS = new Set(["secondary", "bachelor", "master", "phd", "other", "prefer_not_to_say"]);
const ENGLISH_LEVELS = new Set(["a1", "a2", "b1", "b2", "c1", "c2", "native", "prefer_not_to_say"]);

const isRegionDE = (v: unknown) => {
  if (typeof v !== "string") return false;
  if (v === "not_in_germany" || v === "prefer_not_to_say") return true;
  return /^DE-[A-Z]{2}$/.test(v); // e.g. DE-HE, DE-BW
};

const isLangCode = (v: unknown) => typeof v === "string" && /^[a-z]{2,3}$/i.test(v.trim());

export async function POST(req: Request) {
  const {
    participantId,
    sessionId,

    // personal
    age,
    gender,
    regionDE,
    education,
    nativeLang,
    englishLevel,
    writingConfidence,

    // AIAS-4
    aiasLife,
    aiasWork,
    aiasFutureUse,
    aiasHumanity,

    comment,
  } = await req.json();

  if (!participantId || !sessionId) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  if (!isAge(age)
    || !isLangCode(nativeLang)
    || !GENDERS.has(gender)
    || !isRegionDE(regionDE)
    || !EDUCATIONS.has(education)
    || !ENGLISH_LEVELS.has(englishLevel)
    || !isLikert(writingConfidence)
    || !isLikert(aiasLife)
    || !isLikert(aiasWork)
    || !isLikert(aiasFutureUse)
    || !isLikert(aiasHumanity)) {
    return NextResponse.json({ error: "missing/invalid fields" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, participantId: true },
  });

  if (!session) {
    return NextResponse.json({ error: "session not found" }, { status: 404 });
  }

  if (session.participantId !== participantId) {
    return NextResponse.json({ error: "participant mismatch" }, { status: 403 });
  }

  await prisma.preQuestionnaire.upsert({
    where: { sessionId },
    create: {
      sessionId,
      age,
      gender,
      regionDE: String(regionDE).trim(),
      education,
      nativeLang: nativeLang.trim(),
      englishLevel,
      writingConfidence: Number(writingConfidence),

      aiasLife: Number(aiasLife),
      aiasWork: Number(aiasWork),
      aiasFutureUse: Number(aiasFutureUse),
      aiasHumanity: Number(aiasHumanity),

      comment: comment ? String(comment).slice(0, 200) : null,
    },
    update: {
      age,
      gender,
      regionDE: String(regionDE).trim(),
      education,
      nativeLang: nativeLang.trim(),
      englishLevel,
      writingConfidence: Number(writingConfidence),

      aiasLife: Number(aiasLife),
      aiasWork: Number(aiasWork),
      aiasFutureUse: Number(aiasFutureUse),
      aiasHumanity: Number(aiasHumanity),

      comment: comment ? String(comment).slice(0, 200) : null,
    },
  });

  return NextResponse.json({ ok: true, sessionId });
}
