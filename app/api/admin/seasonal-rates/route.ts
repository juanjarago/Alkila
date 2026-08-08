import { NextResponse } from "next/server";
import { createSeasonalRate, listSeasonalRates } from "@/lib/booking/store";
import type { SeasonalRate } from "@/lib/booking/types";

export const runtime = "nodejs";

function assertAdmin(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return;
  if (req.headers.get("x-admin-token") !== adminToken) {
    throw new Error("No autorizado.");
  }
}

function makeId() {
  return `sea_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function GET(req: Request) {
  try {
    assertAdmin(req);
    const { searchParams } = new URL(req.url);
    const propertySlug = searchParams.get("propertySlug") ?? undefined;
    const rates = await listSeasonalRates(propertySlug);
    return NextResponse.json({ rates });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible cargar temporadas." },
      { status: error?.message === "No autorizado." ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    assertAdmin(req);
    const body = await req.json();
    const rate: SeasonalRate = {
      id: makeId(),
      propertySlug: String(body?.propertySlug ?? ""),
      name: String(body?.name ?? "Temporada especial"),
      from: String(body?.from ?? "").slice(0, 10),
      to: String(body?.to ?? "").slice(0, 10),
      nightCOP: Number(body?.nightCOP ?? 0),
      minNights: body?.minNights ? Number(body.minNights) : undefined,
    };

    if (!rate.propertySlug || !rate.from || !rate.to || rate.to <= rate.from || rate.nightCOP <= 0) {
      return NextResponse.json({ error: "Temporada invalida." }, { status: 400 });
    }

    const saved = await createSeasonalRate(rate);
    return NextResponse.json({ rate: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible crear temporada." },
      { status: error?.message === "No autorizado." ? 401 : 500 }
    );
  }
}
