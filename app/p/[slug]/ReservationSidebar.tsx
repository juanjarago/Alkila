"use client";

import BookingBox from "./BookingBox";

export default function ReservationSidebar({
  property,
  slug,
}: {
  slug: string;
  property: {
    title: string;
    capacity: number;
    staysListingId: string;
  };
}) {
  return (
    <aside id="reserva" className="lg:sticky lg:top-6">
      <BookingBox property={{ ...property, slug }} extras={[]} />
    </aside>
  );
}
