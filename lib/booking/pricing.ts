import { properties } from "@/lib/properties";
import { listPricingRules, listSeasonalRates } from "./store";
import type { PricingRule, QuoteResult } from "./types";

export const DEFAULT_PRICING_RULES: PricingRule[] = [
  {
    propertySlug: "cabana-privada-anapoima-8-personas",
    baseNightCOP: 950000,
    weekendNightCOP: 1150000,
    cleaningFeeCOP: 80000,
    includedGuests: 6,
    extraGuestFeeCOP: 100000,
    minNights: 2,
  },
  {
    propertySlug: "casa-campestre-anapoima-16-personas",
    baseNightCOP: 1750000,
    weekendNightCOP: 2100000,
    cleaningFeeCOP: 150000,
    includedGuests: 12,
    extraGuestFeeCOP: 120000,
    minNights: 2,
  },
  {
    propertySlug: "finca-anapoima-22-personas",
    baseNightCOP: 2400000,
    weekendNightCOP: 2900000,
    cleaningFeeCOP: 220000,
    includedGuests: 16,
    extraGuestFeeCOP: 150000,
    minNights: 2,
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
  const minNights = Math.max(rule.minNights, ...seasonalMinNights);

  if (nightsList.length < minNights) {
    throw new Error(`La estadia minima es de ${minNights} noches.`);
  }

  if (input.guests < 1 || input.guests > property.capacity) {
    throw new Error(`La propiedad permite entre 1 y ${property.capacity} personas.`);
  }

  const subtotalCOP = nightsList.reduce((sum, night) => {
    const seasonalRate = findSeasonalRateForNight(seasonalRates, night);
    const nightPrice = seasonalRate
      ? seasonalRate.nightCOP
      : isWeekendNight(night) && rule.weekendNightCOP
      ? rule.weekendNightCOP
      : rule.baseNightCOP;

    return sum + nightPrice;
  }, 0);

  const extraGuests = Math.max(0, input.guests - rule.includedGuests);
  const extraGuestFeeCOP =
    extraGuests * (rule.extraGuestFeeCOP ?? 0) * nightsList.length;
  const cleaningFeeCOP = rule.cleaningFeeCOP;
  const totalCOP = subtotalCOP + cleaningFeeCOP + extraGuestFeeCOP;
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
    totalCOP,
    blocked: conflicts.length > 0,
    conflicts,
  };
}
