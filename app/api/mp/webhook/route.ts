import { NextResponse } from "next/server";
import { updateReservationStatus } from "@/lib/booking/store";

export const runtime = "nodejs";

async function fetchPayment(paymentId: string) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN.");

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? `Mercado Pago error (${res.status})`);
  }

  return data;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const paymentId =
      body?.data?.id ?? body?.id ?? new URL(req.url).searchParams.get("id");
    const topic =
      body?.type ?? body?.topic ?? new URL(req.url).searchParams.get("topic");

    if (!paymentId || (topic && !String(topic).includes("payment"))) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const payment = await fetchPayment(String(paymentId));
    const externalReference = payment?.external_reference;

    if (!externalReference) {
      return NextResponse.json({ ok: true, ignored: "missing_external_reference" });
    }

    if (payment?.status === "approved") {
      await updateReservationStatus(externalReference, {
        status: "paid",
        paidCOP: Number(payment?.transaction_amount ?? 0),
        paymentId: String(paymentId),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("MP webhook error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Error procesando webhook Mercado Pago" },
      { status: 500 }
    );
  }
}
