import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  console.log("MP webhook:", body);
  return NextResponse.json({ ok: true });
}
