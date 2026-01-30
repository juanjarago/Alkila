import { NextResponse } from "next/server";
import crypto from "crypto";
import { properties } from "@/lib/properties";

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, checkIn, checkOut, guests, extras } = body as {
      slug: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      extras?: string[];
    };

    const property = properties.find((p) => p.slug === slug);
    if (!property) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    // 1) Recalcular precio con STAYS (seguro)
    const res = await fetch(`${process.env.BASE_URL}/api/reserva/calcular-precio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: checkIn,
        to: checkOut,
        listingIds: [property.staysListingId],
        guests,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const raw = await res.text();
      return NextResponse.json({ error: `No fue posible calcular precio. ${raw}` }, { status: 400 });
    }

    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : data;

    const totalCOP = Number(first?._mctotal?.COP ?? 0);
    if (!totalCOP || totalCOP <= 0) {
      return NextResponse.json({ error: "Total inválido" }, { status: 400 });
    }

    // ✅ Anticipo 30%
    const depositCOP = Math.round(totalCOP * 0.3);

    // Wompi usa centavos
    const amountInCents = depositCOP * 100;

    const currency = "COP";
    const reference = `alkila_${slug}_${Date.now()}`;

    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET!;
    const signature = sha256Hex(`${reference}${amountInCents}${currency}${integritySecret}`);

    const redirectUrl = `${process.env.BASE_URL}/checkout/success?ref=${encodeURIComponent(reference)}`;

    const wompiUrl =
      `https://checkout.wompi.co/p/?public-key=${encodeURIComponent(process.env.WOMPI_PUBLIC_KEY!)}` +
      `&currency=${currency}` +
      `&amount-in-cents=${amountInCents}` +
      `&reference=${encodeURIComponent(reference)}` +
      `&signature:integrity=${signature}` +
      `&redirect-url=${encodeURIComponent(redirectUrl)}`;

    return NextResponse.json({
      url: wompiUrl,
      reference,
      depositCOP,
      totalCOP,
      extras: Array.isArray(extras) ? extras : [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error iniciando pago" }, { status: 500 });
  }
}
