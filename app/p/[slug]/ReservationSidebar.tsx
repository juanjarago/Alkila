"use client";

import BookingBox from "./BookingBox";
import AvailabilityCalendar from "./AvailabilityCalendar";
import type { PricingRule } from "@/lib/booking/types";

export default function ReservationSidebar({
  property,
  slug,
  pricingRule,
  bookingReady = true,
}: {
  slug: string;
  pricingRule?: PricingRule;
  bookingReady?: boolean;
  property: {
    title: string;
    capacity: number;
    staysListingId?: string;
    airbnbUrl?: string;
    airbnbHostYears?: number;
    availableExtras?: string[];
  };
}) {
  if (!bookingReady) {
    const message = `Hola, quiero consultar disponibilidad y reservar ${property.title}.`;
    return (
      <section className="rounded-3xl border border-[#C6C0B1] bg-[#F4EFE2] p-6 text-[#17332A]">
        <h2 className="text-2xl font-black">Consulta disponibilidad y reserva</h2>
        <p className="mt-3 text-lg leading-7">Escríbenos con tus fechas y el número de personas. Te confirmaremos la disponibilidad y el valor total antes de reservar.</p>
        <a href={`https://wa.me/573014000436?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#B85F3B] px-6 py-3 font-black text-white">Consultar por WhatsApp</a>
        {property.airbnbUrl ? <a href={property.airbnbUrl} target="_blank" rel="noreferrer" className="ml-0 mt-4 block font-bold underline">Ver y reservar en Airbnb</a> : null}
      </section>
    );
  }
  return (
    <aside id="reserva" className="lg:sticky lg:top-6">
      <BookingBox property={{ ...property, slug }} pricingRule={pricingRule} />
      <AvailabilityCalendar slug={slug} />
    </aside>
  );
}
