import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const {
    sessionId,
    trialIndex,
    workflow,      // 'human' | 'ai' | 'human_ai' | 'ai_human'
  } = body;

  if (!sessionId || !trialIndex || !workflow) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const trial = await prisma.trial.create({
    data: {
      sessionId,
      index: trialIndex,
      workflow,
    },
  });

  return NextResponse.json({ ok: true, trialId: trial.id });
}
