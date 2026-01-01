import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const isLikert = (v: unknown) =>
  Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5;

const isNonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;

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
  } = await req.json();

  if (!participantId || !sessionId) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  if (!isNonEmpty(ageGroup) || !isLangCode(nativeLang)) {
    return NextResponse.json({ error: "missing/invalid fields" }, { status: 400 });
  }

  if (!GENDERS.has(gender)) {
    return NextResponse.json({ error: "missing/invalid fields" }, { status: 400 });
  }

  if (!isRegionDE(regionDE)) {
    return NextResponse.json({ error: "invalid regionDE" }, { status: 400 });
  }

  if (!EDUCATIONS.has(education)) {
    return NextResponse.json({ error: "missing/invalid fields" }, { status: 400 });
  }

  if (!ENGLISH_LEVELS.has(englishLevel)) {
    return NextResponse.json({ error: "missing/invalid fields" }, { status: 400 });
  }

  if (!isLikert(writingConfidence) || !isLikert(aiFamiliarity) || !isLikert(aiAttitude)) {
    return NextResponse.json({ error: "missing/invalid fields" }, { status: 400 });
  }

  // Ensure session exists + belongs to participant
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
      ageGroup: ageGroup.trim(),
      gender,
      regionDE: String(regionDE).trim(),
      education,
      nativeLang: nativeLang.trim(),
      englishLevel,
      writingConfidence: Number(writingConfidence),
      aiFamiliarity: Number(aiFamiliarity),
      aiAttitude: Number(aiAttitude),
      comment: comment ? String(comment).slice(0, 200) : null,
    },
    update: {
      ageGroup: ageGroup.trim(),
      gender,
      regionDE: String(regionDE).trim(),
      education,
      nativeLang: nativeLang.trim(),
      englishLevel,
      writingConfidence: Number(writingConfidence),
      aiFamiliarity: Number(aiFamiliarity),
      aiAttitude: Number(aiAttitude),
      comment: comment ? String(comment).slice(0, 200) : null,
    },
  });

  return NextResponse.json({ ok: true, sessionId });
}
