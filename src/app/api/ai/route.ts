import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const Body = z.object({
  input: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });

  const client = new OpenAI({ apiKey });

  const resp = await client.responses.create({
    model: "gpt-4o-mini",
    input: parsed.data.input,
    temperature: 0.7,
  });

  const text = (resp as any).output_text ?? "";
  return NextResponse.json({ text });
}
