import { NextResponse } from "next/server";
import { adminStatus, assertAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    assertAdmin(req);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible validar admin." },
      { status: adminStatus(error) }
    );
  }
}
