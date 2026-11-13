import type { Property } from "@/lib/properties";

// The export acknowledgement is set only after importing Alkila's feed in Airbnb.
// Having an inbound feed alone does not protect against Airbnb selling direct dates.
export function isPropertyCalendarReady(property: Property) {
  if (!property.requiresCalendarSync) return true;
  return Boolean(process.env.AIRBNB_ICAL_CASA_DAVID_URL?.trim()) &&
    process.env.CASA_DAVID_AIRBNB_IMPORT_CONFIRMED === "true";
}

export function requirePropertyCalendar(property: Property) {
  if (!isPropertyCalendarReady(property)) {
    throw new Error("Consulta la disponibilidad y reserva de Casa David por WhatsApp.");
  }
}
