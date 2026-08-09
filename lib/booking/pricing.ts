import { properties } from "@/lib/properties";
import { normalizeBookingExtras } from "./extras";
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
  return day === 5 || day === 6;
}

function findSeasonalRateForNight(
  rates: Awaited<ReturnType<typeof listSeasonalRates>>,
  ymd: string
) {
  return rates.find((rate) => ymd >= rate.from && ymd < rate.to);
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
  const seasonalMinNights = seasonalRates
    .filter((rate) => nightsList.some((night) => night >= rate.from && night < rate.to))
    .map((rate) => rate.minNights ?? 0);
  const usesWeekendRate = nightsList.some(isWeekendNight);
  const baseMinNights = usesWeekendRate
    ? rule.minWeekendNights
    : rule.minWeekdayNights;
  const minNights = Math.max(baseMinNights, ...seasonalMinNights);

  if (nightsList.length < minNights) {
    throw new Error(`La estadia minima es de ${minNights} noches.`);
  }

  if (input.guests < 1 || input.guests > property.capacity) {
    throw new Error(`La propiedad permite entre 1 y ${property.capacity} personas.`);
  }

  function nightPriceFor(night: string) {
    const seasonalRate = findSeasonalRateForNight(seasonalRates, night);
    return seasonalRate
      ? seasonalRate.nightCOP
      : isWeekendNight(night) && rule.weekendNightCOP
      ? rule.weekendNightCOP
      : rule.baseNightCOP;
  }

  const subtotalCOP = nightsList.reduce(
    (sum, night) => sum + nightPriceFor(night),
    0
  );

  const extraGuests = Math.max(0, input.guests - rule.includedGuests);
  const extraGuestFeeCOP =
    extraGuests * (rule.extraGuestFeeCOP ?? 0) * nightsList.length;
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
