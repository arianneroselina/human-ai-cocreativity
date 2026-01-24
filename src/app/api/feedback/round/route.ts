import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { usesAI } from "@/lib/experiment";

const isLikert = (v: unknown) => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5;

export async function POST(req: Request) {
  const {
    sessionId,
    roundIndex,
    workflow,
    liking,
    trust,
    satisfaction,
    mentalDemand,
    physicalDemand,
    temporalDemand,
    effort,
    frustration,
    comment,
  } = await req.json();

  if (!sessionId || typeof roundIndex !== "number" || !workflow) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  // Check if the trust value is required for AI workflows
  const trustVal = usesAI(workflow) && isLikert(trust) ? Number(trust) : null;
  if (usesAI(workflow) && trustVal === null) {
    return NextResponse.json({ error: "trust required for AI workflows" }, { status: 400 });
  }

  // Fetch round details to ensure it exists
  const round = await prisma.round.findUnique({
    where: { sessionId_index: { sessionId, index: roundIndex } },
    select: { id: true },
  });
  if (!round) {
    return NextResponse.json({ error: "round not found" }, { status: 404 });
  }

  // Upsert the feedback data for the round
  await prisma.roundFeedback.upsert({
    where: { sessionId_roundIndex: { sessionId, roundIndex } },
    create: {
      sessionId,
      roundIndex,
      workflow,
      liking: liking ?? null,
      trust: trustVal, // null for human-only workflows
      satisfaction: satisfaction ?? null,
      mentalDemand: mentalDemand ?? null,
      physicalDemand: physicalDemand ?? null,
      temporalDemand: temporalDemand ?? null,
      effort: effort ?? null,
      frustration: frustration ?? null,
      comment: comment ? String(comment).slice(0, 200) : null,
    },
    update: {
      workflow,
      liking: liking ?? null,
      trust: trustVal,
      satisfaction: satisfaction ?? null,
      mentalDemand: mentalDemand ?? null,
      physicalDemand: physicalDemand ?? null,
      temporalDemand: temporalDemand ?? null,
      effort: effort ?? null,
      frustration: frustration ?? null,
      comment: comment ? String(comment).slice(0, 200) : null,
    },
  });

  return NextResponse.json({ ok: true, sessionId, roundIndex });
}
