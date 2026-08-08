import { NextResponse } from "next/server";
import { collectAvailabilityConflicts } from "@/lib/booking/availability";
import { quoteDirectStay } from "@/lib/booking/pricing";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const propertySlug = String(body?.propertySlug ?? "").trim();
    const from = String(body?.from ?? "").slice(0, 10);
    const to = String(body?.to ?? "").slice(0, 10);
    const guests = Number(body?.guests ?? 0);

    if (!propertySlug || !from || !to || to <= from || guests < 1) {
      return NextResponse.json(
        { error: "Datos invalidos para cotizar." },
        { status: 400 }
      );
    }

    const conflicts = await collectAvailabilityConflicts({ propertySlug, from, to });
    const quote = await quoteDirectStay({ propertySlug, from, to, guests, conflicts });

    return NextResponse.json(quote, { status: quote.blocked ? 409 : 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible cotizar la reserva." },
      { status: 500 }
    );
  }
}
