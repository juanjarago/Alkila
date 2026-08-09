import type { BookingExtra } from "./types";

export const BOOKING_EXTRA_DEFINITIONS: Array<{
  id: BookingExtra;
  label: string;
  description: string;
  priceLabel: string;
}> = [
  {
    id: "pets",
    label: "Mascotas",
    description: "Tarifa unica por estadia.",
    priceLabel: "$50.000",
  },
  {
    id: "domestic_service",
    label: "Servicio domestico",
    description: "Apoyo durante los dias de la estadia.",
    priceLabel: "$90.000 por dia",
  },
  {
    id: "early_checkin",
    label: "Early check-in",
    description: "Ingreso antes de la hora regular, sujeto a disponibilidad.",
    priceLabel: "50% de una noche",
  },
  {
    id: "late_checkout",
    label: "Late check-out",
    description: "Salida despues de la hora regular, sujeto a disponibilidad.",
    priceLabel: "50% de una noche",
  },
];

const validExtras = new Set<BookingExtra>(
  BOOKING_EXTRA_DEFINITIONS.map((extra) => extra.id)
);

export function normalizeBookingExtras(value: unknown): BookingExtra[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => String(item).trim())
        .filter((item): item is BookingExtra => validExtras.has(item as BookingExtra))
    )
  );
}

export function getBookingExtraLabel(id: string) {
  return (
    BOOKING_EXTRA_DEFINITIONS.find((extra) => extra.id === id)?.label ?? id
  );
}
