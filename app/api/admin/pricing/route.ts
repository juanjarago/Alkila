import { NextResponse } from "next/server";
import { adminStatus, assertAdmin } from "@/lib/admin/auth";
import { DEFAULT_PRICING_RULES } from "@/lib/booking/pricing";
import { listPricingRules, upsertPricingRule } from "@/lib/booking/store";
import type { PricingRule } from "@/lib/booking/types";

export const runtime = "nodejs";

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
      { status: adminStatus(error) }
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
      minNights: Number(body?.minWeekdayNights ?? body?.minNights ?? 1),
      minWeekdayNights: Number(body?.minWeekdayNights ?? body?.minNights ?? 1),
      minWeekendNights: Number(body?.minWeekendNights ?? body?.minNights ?? 1),
      petFeeCOP: Number(body?.petFeeCOP ?? 0),
      domesticServiceFeePerDayCOP: Number(body?.domesticServiceFeePerDayCOP ?? 0),
      earlyCheckInPercent: Number(body?.earlyCheckInPercent ?? 0),
      lateCheckoutPercent: Number(body?.lateCheckoutPercent ?? 0),
      holidayWeekendIncreasePercent: Number(body?.holidayWeekendIncreasePercent ?? 0),
      holidayWeekendMinNights: Number(body?.holidayWeekendMinNights ?? 3),
      holyWeekIncreasePercent: Number(body?.holyWeekIncreasePercent ?? 0),
      holyWeekMinNights: Number(body?.holyWeekMinNights ?? 4),
      schoolBreakIncreasePercent: Number(body?.schoolBreakIncreasePercent ?? 0),
      schoolBreakMinNights: Number(body?.schoolBreakMinNights ?? 4),
      christmasIncreasePercent: Number(body?.christmasIncreasePercent ?? 0),
      christmasMinNights: Number(body?.christmasMinNights ?? 4),
      newYearIncreasePercent: Number(body?.newYearIncreasePercent ?? 0),
      newYearMinNights: Number(body?.newYearMinNights ?? 4),
    };

    const autoIncreases = [
      rule.holidayWeekendIncreasePercent,
      rule.holyWeekIncreasePercent,
      rule.schoolBreakIncreasePercent,
      rule.christmasIncreasePercent,
      rule.newYearIncreasePercent,
    ];
    const autoMinimums = [
      rule.holidayWeekendMinNights,
      rule.holyWeekMinNights,
      rule.schoolBreakMinNights,
      rule.christmasMinNights,
      rule.newYearMinNights,
    ];

    if (
      !rule.propertySlug ||
      rule.baseNightCOP <= 0 ||
      rule.cleaningFeeCOP < 0 ||
      rule.includedGuests < 1 ||
      rule.minWeekdayNights < 1 ||
      rule.minWeekendNights < 1 ||
      rule.petFeeCOP < 0 ||
      rule.domesticServiceFeePerDayCOP < 0 ||
      rule.earlyCheckInPercent < 0 ||
      rule.earlyCheckInPercent > 100 ||
      rule.lateCheckoutPercent < 0 ||
      rule.lateCheckoutPercent > 100 ||
      autoIncreases.some((percent) => percent < 0 || percent > 300) ||
      autoMinimums.some((nights) => nights < 1)
    ) {
      return NextResponse.json({ error: "Regla de precios inválida." }, { status: 400 });
    }

    const saved = await upsertPricingRule(rule);
    return NextResponse.json({ rule: saved });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible guardar precios." },
      { status: adminStatus(error) }
    );
  }
}
