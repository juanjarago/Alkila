import { NextResponse } from "next/server";
import { blockedEventsForRange, fetchIcalBlockedEvents } from "@/lib/ical";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = String(body?.url ?? "").trim();
    const from = String(body?.from ?? "").slice(0, 10);
    const to = String(body?.to ?? "").slice(0, 10);

    if (!url || !url.endsWith(".ics") && !url.includes(".ics?")) {
      return NextResponse.json(
        { error: "URL iCal inválida. Debe ser un enlace .ics de Airbnb." },
        { status: 400 }
      );
    }

    if (!from || !to || to <= from) {
      return NextResponse.json(
        { error: "Fechas inválidas. Usa from/to en formato YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const events = await fetchIcalBlockedEvents(url);
    const conflicts = blockedEventsForRange(events, from, to);

    return NextResponse.json({
      ok: true,
      available: conflicts.length === 0,
      totalBlockedEvents: events.length,
      conflicts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible leer el calendario iCal." },
      { status: 502 }
    );
  }
}
