import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { participantId, sessionId, totalTrials } = await req.json();

  if (!participantId || !sessionId || !totalTrials) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  await prisma.participant.upsert({
    where: { id: participantId },
    create: { id: participantId },
    update: {},
  });

  await prisma.session.create({
    data: { id: sessionId, participantId, totalTrials },
  });

  return NextResponse.json({ ok: true });
}
