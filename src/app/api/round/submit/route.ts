import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const {
    sessionId,
    roundIndex,
    workflow,      // 'human' | 'ai' | 'human_ai' | 'ai_human'
    text,
    metrics = {},  // { wordCount, meetsRequiredWords, meetsAvoidWords }
  } = body;

  if (!sessionId || !roundIndex || !workflow) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const findRound = await prisma.round.findUnique({
    where: { sessionId_index: { sessionId, index: roundIndex } },
  });

  if (!findRound) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 });
  }

  const startedAt = findRound.startedAt;
  const submittedAt = new Date();
  const timeMs = submittedAt.getTime() - startedAt.getTime();

  const round = await prisma.round.update({
    where: { id: findRound.id },
    data: {
      submittedAt,
      timeMs,
      wordCount: metrics.wordCount ?? null,
      meetsRequiredWords: metrics.meetsRequiredWords ?? null,
      meetsAvoidWords: metrics.meetsAvoidWords ?? null,
      text,
    },
  });

  return NextResponse.json({ ok: true, roundId: round.id });
}
