import { properties } from "@/lib/properties";
import {
  colombiaSeasonMatches,
  isSundayBeforeColombiaHolidayMonday,
} from "./colombiaCalendar";
import { normalizeBookingExtras } from "./extras";
import { standardizedStay } from "./standardPricing";
import { listPricingRules, listSeasonalRates } from "./store";
import type { BookingExtra, PricingRule, QuoteResult } from "./types";

export const DEFAULT_PRICING_RULES: PricingRule[] = [
  {
    propertySlug: "cabana-privada-anapoima-8-personas",
    baseNightCOP: 950000,
    weekendNightCOP: 1150000,
    cleaningFeeCOP: 80000,
    includedGuests: 6,
    extraGuestFeeCOP: 100000,
    minNights: 2,
    minWeekdayNights: 2,
    minWeekendNights: 2,
    petFeeCOP: 50000,
    domesticServiceFeePerDayCOP: 90000,
    earlyCheckInPercent: 50,
    lateCheckoutPercent: 50,
    holidayWeekendIncreasePercent: 20,
    holidayWeekendMinNights: 3,
    holyWeekIncreasePercent: 40,
    holyWeekMinNights: 4,
    schoolBreakIncreasePercent: 25,
    schoolBreakMinNights: 4,
    christmasIncreasePercent: 35,
    christmasMinNights: 4,
    newYearIncreasePercent: 45,
    newYearMinNights: 4,
  },
  {
    propertySlug: "casa-campestre-anapoima-16-personas",
    baseNightCOP: 1750000,
    weekendNightCOP: 2100000,
    cleaningFeeCOP: 150000,
    includedGuests: 12,
    extraGuestFeeCOP: 120000,
    minNights: 2,
    minWeekdayNights: 2,
    minWeekendNights: 2,
    petFeeCOP: 50000,
    domesticServiceFeePerDayCOP: 90000,
    earlyCheckInPercent: 50,
    lateCheckoutPercent: 50,
    holidayWeekendIncreasePercent: 20,
    holidayWeekendMinNights: 3,
    holyWeekIncreasePercent: 40,
    holyWeekMinNights: 4,
    schoolBreakIncreasePercent: 25,
    schoolBreakMinNights: 4,
    christmasIncreasePercent: 35,
    christmasMinNights: 4,
    newYearIncreasePercent: 45,
    newYearMinNights: 4,
  },
  {
    propertySlug: "finca-anapoima-22-personas",
    baseNightCOP: 2400000,
    weekendNightCOP: 2900000,
    cleaningFeeCOP: 220000,
    includedGuests: 16,
    extraGuestFeeCOP: 150000,
    minNights: 2,
    minWeekdayNights: 2,
    minWeekendNights: 2,
    petFeeCOP: 50000,
    domesticServiceFeePerDayCOP: 90000,
    earlyCheckInPercent: 50,
    lateCheckoutPercent: 50,
    holidayWeekendIncreasePercent: 20,
    holidayWeekendMinNights: 3,
    holyWeekIncreasePercent: 40,
    holyWeekMinNights: 4,
    schoolBreakIncreasePercent: 25,
    schoolBreakMinNights: 4,
    christmasIncreasePercent: 35,
    christmasMinNights: 4,
    newYearIncreasePercent: 45,
    newYearMinNights: 4,
  },
];

export function getPricingRule(propertySlug: string) {
  return DEFAULT_PRICING_RULES.find((rule) => rule.propertySlug === propertySlug);
}

export async function getEffectivePricingRule(propertySlug: string) {
  const configuredRules = await listPricingRules();
  return (
    configuredRules.find((rule) => rule.propertySlug === propertySlug) ??
    getPricingRule(propertySlug)
  );
}

export function toYMD(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function enumerateNights(from: string, to: string) {
  for (const value of [from, to]) {
    const parsed = new Date(`${value}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== value) {
      throw new Error("Fechas inválidas.");
    }
  }
  if (to <= from) throw new Error("La salida debe ser posterior a la entrada.");
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const nights: string[] = [];

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    nights.push(toYMD(d));
  }

  return nights;
}

function isWeekendNight(ymd: string) {
  const day = new Date(`${ymd}T00:00:00`).getDay();
  return day === 5 || day === 6 || isSundayBeforeColombiaHolidayMonday(ymd);
}

function findSeasonalRateForNight(
  rates: Awaited<ReturnType<typeof listSeasonalRates>>,
  ymd: string
) {
  return rates.find((rate) => ymd >= rate.from && ymd < rate.to);
}

function automaticIncreasePercent(rule: PricingRule, ymd: string) {
  const percentages = colombiaSeasonMatches(ymd).map((match) => {
    if (match.kind === "holiday_weekend") return rule.holidayWeekendIncreasePercent;
    if (match.kind === "holy_week") return rule.holyWeekIncreasePercent;
    if (match.kind === "school_break") return rule.schoolBreakIncreasePercent;
    if (match.kind === "christmas") return rule.christmasIncreasePercent;
    if (match.kind === "new_year") return rule.newYearIncreasePercent;
    return 0;
  });

  return Math.max(0, ...percentages);
}

function automaticMinNights(rule: PricingRule, ymd: string) {
  const minimums = colombiaSeasonMatches(ymd).map((match) => {
    if (match.kind === "holiday_weekend") return rule.holidayWeekendMinNights;
    if (match.kind === "holy_week") return rule.holyWeekMinNights;
    if (match.kind === "school_break") return rule.schoolBreakMinNights;
    if (match.kind === "christmas") return rule.christmasMinNights;
    if (match.kind === "new_year") return rule.newYearMinNights;
    return 0;
  });

  return Math.max(0, ...minimums);
}

export async function quoteDirectStay(input: {
  propertySlug: string;
  from: string;
  to: string;
  guests: number;
  extras?: BookingExtra[] | string[];
  conflicts?: QuoteResult["conflicts"];
}): Promise<QuoteResult> {
  const property = properties.find((item) => item.slug === input.propertySlug);
  const rule = await getEffectivePricingRule(input.propertySlug);
  if (!property || !rule) throw new Error("Propiedad sin regla de precios.");
  const seasonalRates = await listSeasonalRates(input.propertySlug);

  const nightsList = enumerateNights(input.from, input.to);
  if (!Number.isInteger(input.guests) || !nightsList.length) {
    throw new Error("Fechas o número de personas inválidos.");
  }
  const standard = standardizedStay(input.propertySlug, nightsList, input.guests);
  const legacyNights = nightsList.filter((_, index) => !standard?.[index]);
  const seasonalMinNights = seasonalRates
    .filter((rate) => legacyNights.some((night) => night >= rate.from && night < rate.to))
    .map((rate) => rate.minNights ?? 0);
  const usesWeekendRate = legacyNights.some(isWeekendNight);
  const baseMinNights = !legacyNights.length ? 0 : usesWeekendRate
    ? rule.minWeekendNights
    : rule.minWeekdayNights;
  const automaticSeasonMinNights = legacyNights.map((night) =>
    automaticMinNights(rule, night)
  );
  const minNights = Math.max(
    baseMinNights,
    ...seasonalMinNights,
    ...automaticSeasonMinNights,
    ...(standard ?? []).map((night) => night?.minNights ?? 0)
  );

  if (nightsList.length < minNights) {
    throw new Error(`La estadía mínima es de ${minNights} noches.`);
  }

  if (input.guests < 1 || input.guests > property.capacity) {
    throw new Error(`La propiedad permite entre 1 y ${property.capacity} personas.`);
  }

  function nightPriceFor(night: string) {
    const agreedPrice = standard?.[nightsList.indexOf(night)];
    if (agreedPrice) return agreedPrice.nightCOP;
    const seasonalRate = findSeasonalRateForNight(seasonalRates, night);
    const baseNightPrice = seasonalRate
      ? seasonalRate.nightCOP
      : isWeekendNight(night) && rule.weekendNightCOP
      ? rule.weekendNightCOP
      : rule.baseNightCOP;

    if (seasonalRate) return baseNightPrice;

    const increasePercent = automaticIncreasePercent(rule, night);
    return Math.round(baseNightPrice * (1 + increasePercent / 100));
  }

  const subtotalCOP = nightsList.reduce(
    (sum, night) => sum + nightPriceFor(night),
    0
  );

  const extraGuests = Math.max(0, input.guests - rule.includedGuests);
  const extraGuestFeeCOP =
    nightsList.reduce((sum, _, index) => sum + (standard?.[index]?.extraGuestFeeCOP ??
      extraGuests * (rule.extraGuestFeeCOP ?? 0)), 0);
  const cleaningFeeCOP = rule.cleaningFeeCOP;
  const selectedExtras = normalizeBookingExtras(input.extras);
  const hasExtra = (extra: BookingExtra) => selectedExtras.includes(extra);
  const firstNight = nightsList[0];
  const lastNight = nightsList[nightsList.length - 1];
  const petFeeCOP = hasExtra("pets") ? rule.petFeeCOP : 0;
  const domesticServiceFeeCOP = hasExtra("domestic_service")
    ? rule.domesticServiceFeePerDayCOP * nightsList.length
    : 0;
  const earlyCheckInFeeCOP =
    hasExtra("early_checkin") && firstNight
      ? Math.round(nightPriceFor(firstNight) * (rule.earlyCheckInPercent / 100))
      : 0;
  const lateCheckoutFeeCOP =
    hasExtra("late_checkout") && lastNight
      ? Math.round(nightPriceFor(lastNight) * (rule.lateCheckoutPercent / 100))
      : 0;
  const extrasFeeCOP =
    petFeeCOP + domesticServiceFeeCOP + earlyCheckInFeeCOP + lateCheckoutFeeCOP;
  const totalCOP = subtotalCOP + cleaningFeeCOP + extraGuestFeeCOP + extrasFeeCOP;
  const conflicts = input.conflicts ?? [];

  return {
    propertySlug: input.propertySlug,
    from: input.from,
    to: input.to,
    guests: input.guests,
    nights: nightsList.length,
    minNights,
    subtotalCOP,
    cleaningFeeCOP,
    extraGuestFeeCOP,
    extras: selectedExtras,
    petFeeCOP,
    domesticServiceFeeCOP,
    earlyCheckInFeeCOP,
    lateCheckoutFeeCOP,
    extrasFeeCOP,
    totalCOP,
    blocked: conflicts.length > 0,
    conflicts,
  };
}
