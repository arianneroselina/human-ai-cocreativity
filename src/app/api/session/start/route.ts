import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { participantId, sessionId, totalRounds } = await req.json();

  if (!participantId || !sessionId || !totalRounds) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  await prisma.participant.upsert({
    where: { id: participantId },
    create: { id: participantId },
    update: {},
  });

  await prisma.session.create({
    data: { id: sessionId, participantId, totalRounds },
  });

  return NextResponse.json({ ok: true });
}
