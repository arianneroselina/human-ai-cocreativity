import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const {
    sessionId,
    trialIndex,
    workflow,      // 'human' | 'ai' | 'human_ai' | 'ai_human'
    text,
    metrics = {},  // { wordCount, meetsRequiredWords, meetsAvoidWords }
  } = body;

  if (!sessionId || !trialIndex || !workflow) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const findTrial = await prisma.trial.findUnique({
    where: { sessionId_index: { sessionId, index: trialIndex } },
  });

  if (!findTrial) {
    return NextResponse.json({ error: 'Trial not found' }, { status: 404 });
  }

  const startedAt = findTrial.startedAt;
  const submittedAt = new Date();
  const timeMs = submittedAt.getTime() - startedAt.getTime();

  const trial = await prisma.trial.update({
    where: { id: findTrial.id },
    data: {
      submittedAt,
      timeMs,
      wordCount: metrics.wordCount ?? null,
      meetsRequiredWords: metrics.meetsRequiredWords ?? null,
      meetsAvoidWords: metrics.meetsAvoidWords ?? null,
      text,
    },
  });

  return NextResponse.json({ ok: true, trialId: trial.id });
}
