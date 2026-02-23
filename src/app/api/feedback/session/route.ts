import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const {
    sessionId,
    satisfaction,
    clarity,
    effort,
    frustration,
    workflowRanking,
    rankingReason,
    comment,
  } = await req.json();

  if (!sessionId) return NextResponse.json({ error: "missing sessionId" }, { status: 400 });

  if (!Array.isArray(workflowRanking) || workflowRanking.length === 0) {
    return NextResponse.json({ error: "workflow ranking required" }, { status: 400 });
  }

  await prisma.feedback.create({
    data: {
      sessionId,
      satisfaction: satisfaction ?? null,
      clarity: clarity ?? null,
      effort: effort ?? null,
      frustration: frustration ?? null,
      workflowRanking,
      rankingReason: rankingReason ? String(rankingReason).slice(0, 300) : null,
      comments: comment ? String(comment).slice(0, 1000) : null,
    },
  });

  const findSession = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { startedAt: true },
  });

  if (!findSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const startedAt = findSession.startedAt;
  const finishedAt = new Date();
  const timeMs = finishedAt.getTime() - startedAt.getTime();

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      finishedAt,
      timeMs,
    },
  });

  return NextResponse.json({ ok: true, sessionId });
}
