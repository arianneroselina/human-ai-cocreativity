import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const { participantId, sessionId, consented, version, consentText } = await req.json();

  if (!participantId || !sessionId || typeof consented !== "boolean") {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (!version || !consentText) {
    return NextResponse.json({ error: "missing consent payload" }, { status: 400 });
  }

  // Ensure session exists + belongs to participant
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, participantId: true },
  });
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });
  if (session.participantId !== participantId) {
    return NextResponse.json({ error: "participant mismatch" }, { status: 403 });
  }

  const textHash = crypto.createHash("sha256").update(consentText, "utf8").digest("hex");

  await prisma.consent.upsert({
    where: { sessionId },
    create: {
      sessionId,
      consented,
      consentedAt: consented ? new Date() : null,
      version,
      textHash,
    },
    update: {
      consented,
      consentedAt: consented ? new Date() : null,
      version,
      textHash,
    },
  });

  return NextResponse.json({ ok: true });
}
