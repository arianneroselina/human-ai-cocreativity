import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const usesAI = (w: unknown) =>
  w === "ai" || w === "human_ai" || w === "ai_human";

const isLikert = (v: unknown) =>
  Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5;

const isTlx = (v: unknown) =>
  Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 20;

export async function POST(req: Request) {
  const {
    sessionId,
    roundIndex,
    workflow,
    taskId,

    mentalDemand,
    physicalDemand,
    temporalDemand,
    performance,
    effort,
    frustration,

    aiUnderstanding,
    aiCollaboration,
    aiCreativitySupport,
    aiPerformanceOverall,

    rulesConfidence,
    satisfactionResult,

    comment,
  } = await req.json();

  if (!sessionId || roundIndex === undefined || !workflow || !taskId) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  /* ---------- Validate NASA TLX ---------- */
  if (
    !isTlx(mentalDemand) ||
    !isTlx(physicalDemand) ||
    !isTlx(temporalDemand) ||
    !isTlx(performance) ||
    !isTlx(effort) ||
    !isTlx(frustration)
  ) {
    return NextResponse.json({ error: 'invalid NASA-TLX values' }, { status: 400 });
  }

  /* ---------- Validate AI collaboration ---------- */
  if (usesAI(workflow)) {
    if (
      !isLikert(aiUnderstanding) ||
      !isLikert(aiCollaboration) ||
      !isLikert(aiCreativitySupport) ||
      !isLikert(aiPerformanceOverall)
    ) {
      return NextResponse.json({ error: 'AI collaboration ratings required for AI workflows' }, { status: 400 });
    }
  }

  /* ---------- Validate satisfaction & confidence ---------- */
  if (!isLikert(rulesConfidence)! || isLikert(satisfactionResult)) {
    return NextResponse.json({ error: 'invalid satisfaction or confidence values' }, { status: 400 });
  }

  /* ---------- Ensure round exists ---------- */
  const round = await prisma.round.findUnique({
    where: { sessionId_index: { sessionId, index: roundIndex } },
    select: { id: true },
  });

  if (!round) {
    return NextResponse.json({ error: "round not found" }, { status: 404 });
  }

  /* ---------- Upsert feedback ---------- */
  await prisma.roundFeedback.upsert({
    where: { sessionId_roundIndex: { sessionId, roundIndex } },
    create: {
      sessionId,
      roundIndex,
      workflow,
      taskId,

      mentalDemand,
      physicalDemand,
      temporalDemand,
      performance,
      effort,
      frustration,

      aiUnderstanding: usesAI(workflow) ? aiUnderstanding : null,
      aiCollaboration: usesAI(workflow) ? aiCollaboration : null,
      aiCreativitySupport: usesAI(workflow) ? aiCreativitySupport : null,
      aiPerformanceOverall: usesAI(workflow) ? aiPerformanceOverall : null,

      rulesConfidence,
      satisfactionResult,

      comment: comment ? String(comment).slice(0, 200) : null,
    },
    update: {
      workflow,
      taskId,

      mentalDemand,
      physicalDemand,
      temporalDemand,
      performance,
      effort,
      frustration,

      aiUnderstanding: usesAI(workflow) ? aiUnderstanding : null,
      aiCollaboration: usesAI(workflow) ? aiCollaboration : null,
      aiCreativitySupport: usesAI(workflow) ? aiCreativitySupport : null,
      aiPerformanceOverall: usesAI(workflow) ? aiPerformanceOverall : null,

      rulesConfidence,
      satisfactionResult,

      comment: comment ? String(comment).slice(0, 200) : null,
    },
  });

  return NextResponse.json({ ok: true, sessionId, roundIndex });
}
