import { NextResponse } from "next/server";
import { properties } from "@/lib/properties";
import { listManualBlocks, listReservations } from "@/lib/booking/store";
import type { ManualBlock, Reservation } from "@/lib/booking/types";

export const runtime = "nodejs";

function icalDate(ymd: string) {
  return ymd.replace(/-/g, "");
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function directReservationEvent(reservation: Reservation, now: string) {
  return [
    "BEGIN:VEVENT",
    `UID:${reservation.id}@alkila-web`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${icalDate(reservation.from)}`,
    `DTEND;VALUE=DATE:${icalDate(reservation.to)}`,
    `SUMMARY:${escapeText("Reserva directa Alkila")}`,
    `DESCRIPTION:${escapeText(`${reservation.propertyTitle} - pago confirmado`)}`,
    "END:VEVENT",
  ].join("\r\n");
}

function manualBlockEvent(block: ManualBlock, now: string) {
  return [
    "BEGIN:VEVENT",
    `UID:${block.id}@alkila-web`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${icalDate(block.from)}`,
    `DTEND;VALUE=DATE:${icalDate(block.to)}`,
    `SUMMARY:${escapeText("Bloqueo Alkila")}`,
    `DESCRIPTION:${escapeText(block.reason || "Bloqueo manual")}`,
    "END:VEVENT",
  ].join("\r\n");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);
  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada." }, { status: 404 });
  }

  const [reservations, manualBlocks] = await Promise.all([
    listReservations(slug),
    listManualBlocks(slug),
  ]);

  const paidReservations = reservations.filter(
    (reservation) => reservation.status === "paid"
  );

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const events = [
    ...paidReservations.map((reservation) => directReservationEvent(reservation, now)),
    ...manualBlocks.map((block) => manualBlockEvent(block, now)),
  ]
    .join("\r\n");

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Alkila//Direct bookings//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`Alkila - ${property.shortTitle}`)}`,
    events,
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
