"use client";

import BookingBox from "./BookingBox";
import AvailabilityCalendar from "./AvailabilityCalendar";
import type { PricingRule } from "@/lib/booking/types";

export default function ReservationSidebar({
  property,
  slug,
  pricingRule,
}: {
  slug: string;
  pricingRule?: PricingRule;
  property: {
    title: string;
    capacity: number;
    staysListingId: string;
    airbnbUrl?: string;
    airbnbHostYears?: number;
  };
}) {
  return (
    <aside id="reserva" className="lg:sticky lg:top-6">
      <BookingBox property={{ ...property, slug }} pricingRule={pricingRule} />
      <AvailabilityCalendar slug={slug} />
    </aside>
  );
}
