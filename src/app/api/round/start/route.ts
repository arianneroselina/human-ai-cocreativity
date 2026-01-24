import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const {
    sessionId,
    roundIndex,
    workflow,      // 'human' | 'ai' | 'human_ai' | 'ai_human'
  } = await req.json();

  if (!sessionId || !roundIndex || !workflow) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const round = await prisma.round.create({
    data: {
      sessionId,
      index: roundIndex,
      workflow,
    },
  });

  return NextResponse.json({ ok: true, roundId: round.id });
}
