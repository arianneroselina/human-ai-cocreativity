import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { sessionId, participantId } = await req.json();

  if (!sessionId || !participantId) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const findSession = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!findSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const session = await prisma.session.update({
    where: { id: findSession.id },
    data: {
      participantId: participantId,
    },
  });

  return NextResponse.json({ ok: true, sessionId: session.id });
}
