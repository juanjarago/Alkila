import { NextResponse } from "next/server";
import { createManualBlock, listManualBlocks } from "@/lib/booking/store";
import type { ManualBlock } from "@/lib/booking/types";

export const runtime = "nodejs";

function assertAdmin(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return;
  if (req.headers.get("x-admin-token") !== adminToken) {
    throw new Error("No autorizado.");
  }
}

function makeId() {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function GET(req: Request) {
  try {
    assertAdmin(req);
    const { searchParams } = new URL(req.url);
    const propertySlug = searchParams.get("propertySlug") ?? undefined;
    const blocks = await listManualBlocks(propertySlug);
    return NextResponse.json({ blocks });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible cargar bloqueos." },
      { status: error?.message === "No autorizado." ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    assertAdmin(req);
    const body = await req.json();
    const block: ManualBlock = {
      id: makeId(),
      propertySlug: String(body?.propertySlug ?? ""),
      from: String(body?.from ?? "").slice(0, 10),
      to: String(body?.to ?? "").slice(0, 10),
      reason: String(body?.reason ?? "Bloqueo manual"),
    };

    if (!block.propertySlug || !block.from || !block.to || block.to <= block.from) {
      return NextResponse.json({ error: "Bloqueo invalido." }, { status: 400 });
    }

    const saved = await createManualBlock(block);
    return NextResponse.json({ block: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible crear bloqueo." },
      { status: error?.message === "No autorizado." ? 401 : 500 }
    );
  }
}
