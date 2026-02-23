import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { sessionId, totalRounds, totalPracticeRounds } = await req.json();

  if (!sessionId || !totalRounds || !totalPracticeRounds) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  await prisma.session.create({
    data: {
      id: sessionId,
      totalRounds,
      totalPracticeRounds,
    },
  });

  return NextResponse.json({ ok: true });
}
