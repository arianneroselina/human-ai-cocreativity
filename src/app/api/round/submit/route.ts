import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    sessionId,
    roundIndex,
    workflow, // 'human' | 'ai' | 'human_ai' | 'ai_human'
    text,
    metrics = {},
    evaluation = {},
  } = body ?? {};

  if (!sessionId || typeof roundIndex !== "number" || !workflow) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const findRound = await prisma.round.findUnique({
    where: { sessionId_index: { sessionId, index: roundIndex } },
  });

  if (!findRound) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  const startedAt = findRound.startedAt;
  const submittedAt = new Date();
  const timeMs = submittedAt.getTime() - startedAt.getTime();

  const wordCount =
    typeof metrics.wordCount === "number" ? metrics.wordCount : null;

  const charCount =
    typeof metrics.charCount === "number" ? metrics.charCount : null;

  const taskId = typeof evaluation.taskId === "string" ? evaluation.taskId : null;

  const passed =
    typeof evaluation.passed === "boolean" ? evaluation.passed : null;

  const requirementResults =
    evaluation.requirementResults != null ? evaluation.requirementResults : null;

  const round = await prisma.round.update({
    where: { id: findRound.id },
    data: {
      submittedAt,
      timeMs,
      text: typeof text === "string" ? text : null,
      wordCount,
      charCount,
      taskId,
      passed,
      requirementResults,
    },
  });

  return NextResponse.json({ ok: true, roundId: round.id });
}
