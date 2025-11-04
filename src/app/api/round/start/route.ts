import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const {
    sessionId,
    roundIndex,
    workflow,      // 'human' | 'ai' | 'human_ai' | 'ai_human'
  } = body;

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
