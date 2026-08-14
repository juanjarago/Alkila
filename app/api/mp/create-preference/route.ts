import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { collectAvailabilityConflicts } from "@/lib/booking/availability";
import { quoteDirectStay } from "@/lib/booking/pricing";
import { createReservation } from "@/lib/booking/store";
import type { Reservation } from "@/lib/booking/types";
import { properties } from "@/lib/properties";

export const runtime = "nodejs";

function makeReservationId() {
  return `res_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      checkIn,
      checkOut,
      guests,
      payMode = "deposit",
      extras = [],
    } = body as {
      title?: string;
      slug: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      payMode?: "deposit" | "full";
      extras?: string[];
    };

    if (!slug || !checkIn || !checkOut || !Number.isFinite(guests) || guests <= 0) {
      return NextResponse.json(
        { error: "Datos inválidos: slug/checkIn/checkOut/guests" },
        { status: 400 }
      );
    }

    const property = properties.find((item) => item.slug === slug);
    if (!property) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    const conflicts = await collectAvailabilityConflicts({
      propertySlug: slug,
      from: checkIn,
      to: checkOut,
    });

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: "La propiedad no está disponible para esas fechas.", conflicts },
        { status: 409 }
      );
    }

    const quote = await quoteDirectStay({
      propertySlug: slug,
      from: checkIn,
      to: checkOut,
      guests,
      extras,
      conflicts,
    });

    const total = quote.totalCOP;
    const amount =
      payMode === "deposit" ? Math.round(total * 0.3) : Math.round(total);

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
      .replace(/\/$/, "");

    if (!siteUrl.startsWith("http")) {
      return NextResponse.json(
        { error: `NEXT_PUBLIC_SITE_URL inválido: "${siteUrl}"` },
        { status: 500 }
      );
    }

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Falta MERCADOPAGO_ACCESS_TOKEN en variables de entorno" },
        { status: 500 }
      );
    }

    const reservationId = makeReservationId();
    const external_reference = `alkila_${reservationId}`;
    const now = new Date().toISOString();

    const reservation: Reservation = {
      id: reservationId,
      propertySlug: slug,
      propertyTitle: property.title,
      from: checkIn,
      to: checkOut,
      guests,
      totalCOP: total,
      payMode,
      paidCOP: 0,
      status: "pending_payment",
      source: "direct",
      externalReference: external_reference,
      paymentProvider: "mercadopago",
      createdAt: now,
      updatedAt: now,
    };

    await createReservation(reservation);

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });

    const preference = new Preference(client);
    const back_urls = {
      success: `${siteUrl}/checkout/success?ref=${encodeURIComponent(external_reference)}`,
      failure: `${siteUrl}/checkout/failure?ref=${encodeURIComponent(external_reference)}`,
      pending: `${siteUrl}/checkout/pending?ref=${encodeURIComponent(external_reference)}`,
    };

    const notification_url =
      siteUrl.includes("localhost") ? undefined : `${siteUrl}/api/mp/webhook`;

    const result = await preference.create({
      body: {
        items: [
          {
            id: `${slug}-${payMode}`,
            title:
              payMode === "deposit"
                ? `Anticipo 30% - ${title ?? property.shortTitle}`
                : `Pago total - ${title ?? property.shortTitle}`,
            quantity: 1,
            currency_id: "COP",
            unit_price: amount,
          },
        ],
        back_urls,
        external_reference,
        metadata: {
          slug,
          checkIn,
          checkOut,
          guests,
          payMode,
          extras,
          totalCOP: total,
          payTodayCOP: amount,
          reservationId,
        },
        ...(notification_url ? { notification_url } : {}),
      },
    });

    const env = (process.env.MERCADOPAGO_ENV || "sandbox").toLowerCase();
    const url =
      env === "production" ? result.init_point : result.sandbox_init_point;

    if (!url) {
      return NextResponse.json(
        { error: "Mercado Pago no devolvio init_point/sandbox_init_point" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url,
      external_reference,
      reservation,
      quote,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error creando preferencia Mercado Pago" },
      { status: 500 }
    );
  }
}
