import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const isLikert = (v: unknown) => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5;

export async function POST(req: Request) {
  const {
    participantId,
    sessionId,
    ageGroup,
    nativeLang,
    writingConfidence,
    aiFamiliarity,
    aiAttitude,
    comment,
  } = await req.json();

  if (!participantId || !sessionId || !ageGroup || !nativeLang) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
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

  // Upsert pre-questionnaire (one per session)
  await prisma.preQuestionnaire.upsert({
    where: { sessionId },
    create: {
      sessionId,
      ageGroup: ageGroup.trim(),
      nativeLang: nativeLang.trim(),
      writingConfidence: Number(writingConfidence),
      aiFamiliarity: Number(aiFamiliarity),
      aiAttitude: Number(aiAttitude),
      comment: comment ? String(comment).slice(0, 200) : null,
    },
    update: {
      ageGroup: ageGroup.trim(),
      nativeLang: nativeLang.trim(),
      writingConfidence: Number(writingConfidence),
      aiFamiliarity: Number(aiFamiliarity),
      aiAttitude: Number(aiAttitude),
      comment: comment ? String(comment).slice(0, 200) : null,
    },
  });

  return NextResponse.json({ ok: true, sessionId });
}
