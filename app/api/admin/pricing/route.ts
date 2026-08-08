import { NextResponse } from "next/server";
import { DEFAULT_PRICING_RULES } from "@/lib/booking/pricing";
import { listPricingRules, upsertPricingRule } from "@/lib/booking/store";
import type { PricingRule } from "@/lib/booking/types";

export const runtime = "nodejs";

function assertAdmin(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return;
  if (req.headers.get("x-admin-token") !== adminToken) {
    throw new Error("No autorizado.");
  }
}

export async function GET(req: Request) {
  try {
    assertAdmin(req);
    const configured = await listPricingRules();
    const rules = DEFAULT_PRICING_RULES.map((rule) => ({
      ...rule,
      ...(configured.find((item) => item.propertySlug === rule.propertySlug) ?? {}),
    }));
    return NextResponse.json({ rules });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible cargar precios." },
      { status: error?.message === "No autorizado." ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    assertAdmin(req);
    const body = await req.json();
    const rule: PricingRule = {
      propertySlug: String(body?.propertySlug ?? ""),
      baseNightCOP: Number(body?.baseNightCOP ?? 0),
      weekendNightCOP: Number(body?.weekendNightCOP ?? 0),
      cleaningFeeCOP: Number(body?.cleaningFeeCOP ?? 0),
      extraGuestFeeCOP: Number(body?.extraGuestFeeCOP ?? 0),
      includedGuests: Number(body?.includedGuests ?? 1),
      minNights: Number(body?.minNights ?? 1),
    };

    if (
      !rule.propertySlug ||
      rule.baseNightCOP <= 0 ||
      rule.cleaningFeeCOP < 0 ||
      rule.includedGuests < 1 ||
      rule.minNights < 1
    ) {
      return NextResponse.json({ error: "Regla de precios invalida." }, { status: 400 });
    }

    const saved = await upsertPricingRule(rule);
    return NextResponse.json({ rule: saved });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible guardar precios." },
      { status: error?.message === "No autorizado." ? 401 : 500 }
    );
  }
}
