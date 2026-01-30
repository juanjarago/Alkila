import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      slug,
      checkIn,
      checkOut,
      guests,
      totalCOP,
      payMode = "deposit", // ✅ default por seguridad
      extras = [],
    } = body as {
      title?: string;
      slug: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      totalCOP: number;
      payMode?: "deposit" | "full";
      extras?: string[];
    };

    // ✅ Validaciones mínimas
    if (!slug || !checkIn || !checkOut || !Number.isFinite(guests) || guests <= 0) {
      return NextResponse.json(
        { error: "Datos inválidos: slug/checkIn/checkOut/guests" },
        { status: 400 }
      );
    }

    const total = Number(totalCOP || 0);
    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: "totalCOP inválido" }, { status: 400 });
    }

    const amount =
      payMode === "deposit" ? Math.round(total * 0.3) : Math.round(total);

    // ✅ Siempre sin slash final
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
      /\/$/,
      ""
    );

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

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });

    const preference = new Preference(client);

    const external_reference = `alkila_${slug}_${Date.now()}`;

    const back_urls = {
      success: `${siteUrl}/checkout/success?ref=${encodeURIComponent(external_reference)}`,
      failure: `${siteUrl}/checkout/failure?ref=${encodeURIComponent(external_reference)}`,
      pending: `${siteUrl}/checkout/pending?ref=${encodeURIComponent(external_reference)}`,
    };

    const notification_url =
      siteUrl.includes("localhost") ? undefined : `${siteUrl}/api/mp/webhook`;

    console.log("MP siteUrl:", siteUrl);
    console.log("MP back_urls:", back_urls);
    console.log("MP payMode:", payMode, "total:", total, "amount:", amount);

    const result = await preference.create({
      body: {
        items: [
          {
            id: `${slug}-${payMode}`, // ✅ FIX: requerido por el type Items del SDK
            title:
              payMode === "deposit"
                ? `Anticipo 30% - ${title ?? slug}`
                : `Pago total - ${title ?? slug}`,
            quantity: 1,
            currency_id: "COP",
            unit_price: amount,
          },
        ],
        back_urls,

        // Lo reactivamos cuando ya todo esté perfecto
        // auto_return: "approved",

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
        },

        ...(notification_url ? { notification_url } : {}),
      },
    });

    const env = (process.env.MERCADOPAGO_ENV || "sandbox").toLowerCase();

    const url =
      env === "production" ? result.init_point : result.sandbox_init_point;

    if (!url) {
      return NextResponse.json(
        { error: "Mercado Pago no devolvió init_point/sandbox_init_point" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url, external_reference });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error creando preferencia Mercado Pago" },
      { status: 500 }
    );
  }
}
