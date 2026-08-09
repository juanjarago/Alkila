export type BookingStatus = "pending_payment" | "paid" | "cancelled";

export type BookingExtra =
  | "pets"
  | "domestic_service"
  | "early_checkin"
  | "late_checkout";

export type PricingRule = {
  propertySlug: string;
  baseNightCOP: number;
  weekendNightCOP?: number;
  cleaningFeeCOP: number;
  extraGuestFeeCOP?: number;
  includedGuests: number;
  minNights: number;
  minWeekdayNights: number;
  minWeekendNights: number;
  petFeeCOP: number;
  domesticServiceFeePerDayCOP: number;
  earlyCheckInPercent: number;
  lateCheckoutPercent: number;
  holidayWeekendIncreasePercent: number;
  holyWeekIncreasePercent: number;
  schoolBreakIncreasePercent: number;
  christmasIncreasePercent: number;
  newYearIncreasePercent: number;
};

export type SeasonalRate = {
  id: string;
  propertySlug: string;
  name: string;
  from: string;
  to: string;
  nightCOP: number;
  minNights?: number;
};

export type ManualBlock = {
  id: string;
  propertySlug: string;
  from: string;
  to: string;
  reason: string;
};

export type Reservation = {
  id: string;
  propertySlug: string;
  propertyTitle: string;
  from: string;
  to: string;
  guests: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  totalCOP: number;
  payMode: "deposit" | "full";
  paidCOP: number;
  status: BookingStatus;
  source: "direct";
  externalReference: string;
  paymentProvider?: "mercadopago";
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
};

export type QuoteResult = {
  propertySlug: string;
  from: string;
  to: string;
  guests: number;
  nights: number;
  minNights: number;
  subtotalCOP: number;
  cleaningFeeCOP: number;
  extraGuestFeeCOP: number;
  extras: BookingExtra[];
  petFeeCOP: number;
  domesticServiceFeeCOP: number;
  earlyCheckInFeeCOP: number;
  lateCheckoutFeeCOP: number;
  extrasFeeCOP: number;
  totalCOP: number;
  blocked: boolean;
  conflicts: Array<{
    source: "airbnb" | "booking" | "direct" | "manual";
    start: string;
    end: string;
    summary?: string;
  }>;
};
