import type { ManualBlock, PricingRule, Reservation, SeasonalRate } from "./types";

const memoryReservations: Reservation[] = [];
const memoryBlocks: ManualBlock[] = [];
const memoryPricingRules: PricingRule[] = [];
const memorySeasonalRates: SeasonalRate[] = [];

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

async function supabaseRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const config = supabaseConfig();
  if (!config) throw new Error("Supabase no configurado.");

  const res = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.message ?? `Supabase error (${res.status})`);
  }

  return data as T;
}

function asReservation(row: any): Reservation {
  return {
    id: row.id,
    propertySlug: row.property_slug,
    propertyTitle: row.property_title,
    from: row.date_from,
    to: row.date_to,
    guests: row.guests,
    guestName: row.guest_name ?? undefined,
    guestEmail: row.guest_email ?? undefined,
    guestPhone: row.guest_phone ?? undefined,
    totalCOP: row.total_cop,
    payMode: row.pay_mode,
    paidCOP: row.paid_cop,
    status: row.status,
    source: "direct",
    externalReference: row.external_reference,
    paymentProvider: row.payment_provider ?? undefined,
    paymentId: row.payment_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function reservationToRow(reservation: Reservation) {
  return {
    id: reservation.id,
    property_slug: reservation.propertySlug,
    property_title: reservation.propertyTitle,
    date_from: reservation.from,
    date_to: reservation.to,
    guests: reservation.guests,
    guest_name: reservation.guestName ?? null,
    guest_email: reservation.guestEmail ?? null,
    guest_phone: reservation.guestPhone ?? null,
    total_cop: reservation.totalCOP,
    pay_mode: reservation.payMode,
    paid_cop: reservation.paidCOP,
    status: reservation.status,
    source: reservation.source,
    external_reference: reservation.externalReference,
    payment_provider: reservation.paymentProvider ?? null,
    payment_id: reservation.paymentId ?? null,
    created_at: reservation.createdAt,
    updated_at: reservation.updatedAt,
  };
}

function asPricingRule(row: any): PricingRule {
  return {
    propertySlug: row.property_slug,
    baseNightCOP: row.base_night_cop,
    weekendNightCOP: row.weekend_night_cop ?? undefined,
    cleaningFeeCOP: row.cleaning_fee_cop,
    extraGuestFeeCOP: row.extra_guest_fee_cop ?? undefined,
    includedGuests: row.included_guests,
    minNights: row.min_nights,
    minWeekdayNights: row.min_weekday_nights ?? row.min_nights ?? 1,
    minWeekendNights: row.min_weekend_nights ?? row.min_nights ?? 1,
    petFeeCOP: row.pet_fee_cop ?? 50000,
    domesticServiceFeePerDayCOP: row.domestic_service_fee_per_day_cop ?? 90000,
    earlyCheckInPercent: row.early_checkin_percent ?? 50,
    lateCheckoutPercent: row.late_checkout_percent ?? 50,
    holidayWeekendIncreasePercent: row.holiday_weekend_increase_percent ?? 20,
    holidayWeekendMinNights: row.holiday_weekend_min_nights ?? 3,
    holyWeekIncreasePercent: row.holy_week_increase_percent ?? 40,
    holyWeekMinNights: row.holy_week_min_nights ?? 4,
    schoolBreakIncreasePercent: row.school_break_increase_percent ?? 25,
    schoolBreakMinNights: row.school_break_min_nights ?? 4,
    christmasIncreasePercent: row.christmas_increase_percent ?? 35,
    christmasMinNights: row.christmas_min_nights ?? 4,
    newYearIncreasePercent: row.new_year_increase_percent ?? 45,
    newYearMinNights: row.new_year_min_nights ?? 4,
  };
}

function pricingRuleToRow(rule: PricingRule) {
  return {
    property_slug: rule.propertySlug,
    base_night_cop: rule.baseNightCOP,
    weekend_night_cop: rule.weekendNightCOP ?? null,
    cleaning_fee_cop: rule.cleaningFeeCOP,
    extra_guest_fee_cop: rule.extraGuestFeeCOP ?? 0,
    included_guests: rule.includedGuests,
    min_nights: rule.minWeekdayNights,
    min_weekday_nights: rule.minWeekdayNights,
    min_weekend_nights: rule.minWeekendNights,
    pet_fee_cop: rule.petFeeCOP,
    domestic_service_fee_per_day_cop: rule.domesticServiceFeePerDayCOP,
    early_checkin_percent: rule.earlyCheckInPercent,
    late_checkout_percent: rule.lateCheckoutPercent,
    holiday_weekend_increase_percent: rule.holidayWeekendIncreasePercent,
    holiday_weekend_min_nights: rule.holidayWeekendMinNights,
    holy_week_increase_percent: rule.holyWeekIncreasePercent,
    holy_week_min_nights: rule.holyWeekMinNights,
    school_break_increase_percent: rule.schoolBreakIncreasePercent,
    school_break_min_nights: rule.schoolBreakMinNights,
    christmas_increase_percent: rule.christmasIncreasePercent,
    christmas_min_nights: rule.christmasMinNights,
    new_year_increase_percent: rule.newYearIncreasePercent,
    new_year_min_nights: rule.newYearMinNights,
  };
}

function asManualBlock(row: any): ManualBlock {
  return {
    id: row.id,
    propertySlug: row.property_slug,
    from: row.date_from,
    to: row.date_to,
    reason: row.reason,
  };
}

function manualBlockToRow(block: ManualBlock) {
  return {
    id: block.id,
    property_slug: block.propertySlug,
    date_from: block.from,
    date_to: block.to,
    reason: block.reason,
  };
}

function asSeasonalRate(row: any): SeasonalRate {
  return {
    id: row.id,
    propertySlug: row.property_slug,
    name: row.name,
    from: row.date_from,
    to: row.date_to,
    nightCOP: row.night_cop,
    minNights: row.min_nights ?? undefined,
  };
}

function seasonalRateToRow(rate: SeasonalRate) {
  return {
    id: rate.id,
    property_slug: rate.propertySlug,
    name: rate.name,
    date_from: rate.from,
    date_to: rate.to,
    night_cop: rate.nightCOP,
    min_nights: rate.minNights ?? null,
  };
}

export async function listReservations(propertySlug?: string) {
  const config = supabaseConfig();
  if (!config) {
    return memoryReservations.filter(
      (reservation) => !propertySlug || reservation.propertySlug === propertySlug
    );
  }

  const query = propertySlug
    ? `reservations?property_slug=eq.${encodeURIComponent(propertySlug)}&order=date_from.asc`
    : "reservations?order=date_from.asc";
  const rows = await supabaseRequest<any[]>(query);
  return rows.map(asReservation);
}

export async function getReservationByReference(externalReference: string) {
  const config = supabaseConfig();
  if (!config) {
    return memoryReservations.find(
      (reservation) => reservation.externalReference === externalReference
    );
  }

  const rows = await supabaseRequest<any[]>(
    `reservations?external_reference=eq.${encodeURIComponent(externalReference)}&limit=1`
  );
  return rows[0] ? asReservation(rows[0]) : undefined;
}

export async function createReservation(reservation: Reservation) {
  const config = supabaseConfig();
  if (!config) {
    memoryReservations.push(reservation);
    return reservation;
  }

  const rows = await supabaseRequest<any[]>("reservations", {
    method: "POST",
    body: JSON.stringify(reservationToRow(reservation)),
  });
  return asReservation(rows[0]);
}

export async function updateReservationStatus(
  externalReference: string,
  updates: Pick<Reservation, "status" | "paidCOP"> & {
    paymentId?: string;
    updatedAt: string;
  }
) {
  const config = supabaseConfig();
  if (!config) {
    const reservation = await getReservationByReference(externalReference);
    if (!reservation) return undefined;
    reservation.status = updates.status;
    reservation.paidCOP = updates.paidCOP;
    reservation.paymentId = updates.paymentId;
    reservation.updatedAt = updates.updatedAt;
    return reservation;
  }

  const rows = await supabaseRequest<any[]>(
    `reservations?external_reference=eq.${encodeURIComponent(externalReference)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: updates.status,
        paid_cop: updates.paidCOP,
        payment_id: updates.paymentId ?? null,
        updated_at: updates.updatedAt,
      }),
    }
  );
  return rows[0] ? asReservation(rows[0]) : undefined;
}

export async function updateReservationStatusById(
  id: string,
  updates: Pick<Reservation, "status" | "paidCOP"> & {
    paymentId?: string;
    updatedAt: string;
  }
) {
  const config = supabaseConfig();
  if (!config) {
    const reservation = memoryReservations.find((item) => item.id === id);
    if (!reservation) return undefined;
    reservation.status = updates.status;
    reservation.paidCOP = updates.paidCOP;
    reservation.paymentId = updates.paymentId;
    reservation.updatedAt = updates.updatedAt;
    return reservation;
  }

  const rows = await supabaseRequest<any[]>(
    `reservations?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: updates.status,
        paid_cop: updates.paidCOP,
        payment_id: updates.paymentId ?? null,
        updated_at: updates.updatedAt,
      }),
    }
  );
  return rows[0] ? asReservation(rows[0]) : undefined;
}

export async function listManualBlocks(propertySlug?: string) {
  const config = supabaseConfig();
  if (!config) {
    return memoryBlocks.filter(
      (block) => !propertySlug || block.propertySlug === propertySlug
    );
  }

  const query = propertySlug
    ? `manual_blocks?property_slug=eq.${encodeURIComponent(propertySlug)}&order=date_from.asc`
    : "manual_blocks?order=date_from.asc";
  const rows = await supabaseRequest<any[]>(query);
  return rows.map(asManualBlock);
}

export async function createManualBlock(block: ManualBlock) {
  const config = supabaseConfig();
  if (!config) {
    memoryBlocks.push(block);
    return block;
  }

  const rows = await supabaseRequest<any[]>("manual_blocks", {
    method: "POST",
    body: JSON.stringify(manualBlockToRow(block)),
  });
  return asManualBlock(rows[0]);
}

export async function listPricingRules() {
  const config = supabaseConfig();
  if (!config) return [...memoryPricingRules];

  const rows = await supabaseRequest<any[]>("pricing_rules?order=property_slug.asc");
  return rows.map(asPricingRule);
}

export async function upsertPricingRule(rule: PricingRule) {
  const config = supabaseConfig();
  if (!config) {
    const idx = memoryPricingRules.findIndex(
      (item) => item.propertySlug === rule.propertySlug
    );
    if (idx === -1) memoryPricingRules.push(rule);
    else memoryPricingRules[idx] = rule;
    return rule;
  }

  const rows = await supabaseRequest<any[]>(
    "pricing_rules?on_conflict=property_slug",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(pricingRuleToRow(rule)),
    }
  );
  return asPricingRule(rows[0]);
}

export async function listSeasonalRates(propertySlug?: string) {
  const config = supabaseConfig();
  if (!config) {
    return memorySeasonalRates.filter(
      (rate) => !propertySlug || rate.propertySlug === propertySlug
    );
  }

  const query = propertySlug
    ? `seasonal_rates?property_slug=eq.${encodeURIComponent(propertySlug)}&order=date_from.asc`
    : "seasonal_rates?order=date_from.asc";
  const rows = await supabaseRequest<any[]>(query);
  return rows.map(asSeasonalRate);
}

export async function createSeasonalRate(rate: SeasonalRate) {
  const config = supabaseConfig();
  if (!config) {
    memorySeasonalRates.push(rate);
    return rate;
  }

  const rows = await supabaseRequest<any[]>("seasonal_rates", {
    method: "POST",
    body: JSON.stringify(seasonalRateToRow(rate)),
  });
  return asSeasonalRate(rows[0]);
}
