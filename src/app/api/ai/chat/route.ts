import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { sessionId, roundIndex, role, content, action, selected } = await req.json();

  if (!sessionId || !roundIndex) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  // find round
  const round = await prisma.round.findUnique({
    where: {
      sessionId_index: {
        sessionId,
        index: roundIndex,
      },
    },
  });

  if (!round) {
    return NextResponse.json({ error: "round not found" }, { status: 404 });
  }

  // ensure chat exists
  const chat = await prisma.aiChat.upsert({
    where: {
      roundId: round.id,
    },
    update: {},
    create: {
      roundId: round.id,
    },
  });

  // unselect previous draft if selecting
  if (action === "select") {
    await prisma.aiChatMessage.updateMany({
      where: {
        chatId: chat.id,
        selected: true,
      },
      data: { selected: false },
    });
  }

  // append event
  await prisma.aiChatMessage.create({
    data: {
      chatId: chat.id,
      role: role ?? "system",
      content: content ?? null,
      action: action ?? null,
      selected: selected ?? false,
    },
  });

  return NextResponse.json({ ok: true });
}
