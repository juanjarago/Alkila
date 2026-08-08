import { NextResponse } from "next/server";
import { properties } from "@/lib/properties";
import { collectAvailabilityConflicts } from "@/lib/booking/availability";
import { quoteDirectStay } from "@/lib/booking/pricing";
import { createReservation, listReservations } from "@/lib/booking/store";
import type { Reservation } from "@/lib/booking/types";

export const runtime = "nodejs";

function makeId() {
  return `res_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function assertAdmin(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return;
  const token = req.headers.get("x-admin-token");
  if (token !== adminToken) throw new Error("No autorizado.");
}

export async function GET(req: Request) {
  try {
    assertAdmin(req);
    const { searchParams } = new URL(req.url);
    const propertySlug = searchParams.get("propertySlug") ?? undefined;
    const reservations = await listReservations(propertySlug);
    return NextResponse.json({ reservations });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible listar reservas." },
      { status: error?.message === "No autorizado." ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const propertySlug = String(body?.propertySlug ?? "").trim();
    const property = properties.find((item) => item.slug === propertySlug);
    if (!property) {
      return NextResponse.json({ error: "Propiedad no encontrada." }, { status: 404 });
    }

    const from = String(body?.from ?? "").slice(0, 10);
    const to = String(body?.to ?? "").slice(0, 10);
    const guests = Number(body?.guests ?? 0);
    const payMode = body?.payMode === "full" ? "full" : "deposit";

    const conflicts = await collectAvailabilityConflicts({ propertySlug, from, to });
    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: "La propiedad no esta disponible para esas fechas.", conflicts },
        { status: 409 }
      );
    }

    const quote = await quoteDirectStay({ propertySlug, from, to, guests, conflicts });
    const now = new Date().toISOString();
    const id = makeId();
    const paidCOP = 0;
    const externalReference = `alkila_${id}`;

    const reservation: Reservation = {
      id,
      propertySlug,
      propertyTitle: property.title,
      from,
      to,
      guests,
      guestName: body?.guestName ? String(body.guestName) : undefined,
      guestEmail: body?.guestEmail ? String(body.guestEmail) : undefined,
      guestPhone: body?.guestPhone ? String(body.guestPhone) : undefined,
      totalCOP: quote.totalCOP,
      payMode,
      paidCOP,
      status: "pending_payment",
      source: "direct",
      externalReference,
      paymentProvider: "mercadopago",
      createdAt: now,
      updatedAt: now,
    };

    const created = await createReservation(reservation);
    return NextResponse.json({ reservation: created, quote }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible crear la reserva." },
      { status: 500 }
    );
  }
}
