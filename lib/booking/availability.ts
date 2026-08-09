import { blockedEventsForRange, fetchIcalBlockedEvents } from "@/lib/ical";
import { properties } from "@/lib/properties";
import { dateRangesOverlap } from "@/lib/ical";
import { listManualBlocks, listReservations } from "./store";
import type { QuoteResult } from "./types";

export const PROPERTY_TO_CHANNEL_ENV: Record<
  string,
  { airbnb?: string; booking?: string }
> = {
  "cabana-privada-anapoima-8-personas": {
    airbnb: "AIRBNB_ICAL_JF08_URL",
    booking: "BOOKING_ICAL_JF08_URL",
  },
  "casa-campestre-anapoima-16-personas": {
    airbnb: "AIRBNB_ICAL_JF06_URL",
    booking: "BOOKING_ICAL_JF06_URL",
  },
  "finca-anapoima-22-personas": {
    airbnb: "AIRBNB_ICAL_JF02_URL",
    booking: "BOOKING_ICAL_JF02_URL",
  },
};

export type ExternalChannelReservation = {
  id: string;
  propertySlug: string;
  propertyTitle: string;
  source: "airbnb" | "booking";
  start: string;
  end: string;
  summary?: string;
};

export type ExternalChannelStatus = {
  propertySlug: string;
  propertyTitle: string;
  source: "airbnb" | "booking";
  configured: boolean;
  events: number;
  error?: string;
};

async function channelConflicts(input: {
  propertySlug: string;
  from: string;
  to: string;
  source: "airbnb" | "booking";
  envName?: string;
}): Promise<QuoteResult["conflicts"]> {
  if (!input.envName) return [];
  const url = process.env[input.envName];
  if (!url) return [];

  const events = await fetchIcalBlockedEvents(url);
  return blockedEventsForRange(events, input.from, input.to).map((event) => ({
    source: input.source,
    start: event.start,
    end: event.end,
    summary: event.summary,
  }));
}

export async function collectAvailabilityConflicts(input: {
  propertySlug: string;
  from: string;
  to: string;
}): Promise<QuoteResult["conflicts"]> {
  const property = properties.find((item) => item.slug === input.propertySlug);
  if (!property) throw new Error("Propiedad no encontrada.");

  const channelEnv = PROPERTY_TO_CHANNEL_ENV[input.propertySlug] ?? {};
  const [airbnb, booking, reservations, manualBlocks] = await Promise.all([
    channelConflicts({ ...input, source: "airbnb", envName: channelEnv.airbnb }),
    channelConflicts({ ...input, source: "booking", envName: channelEnv.booking }),
    listReservations(input.propertySlug),
    listManualBlocks(input.propertySlug),
  ]);

  const direct = reservations
    .filter((reservation) => reservation.status === "paid")
    .filter((reservation) =>
      dateRangesOverlap(input.from, input.to, reservation.from, reservation.to)
    )
    .map((reservation) => ({
      source: "direct" as const,
      start: reservation.from,
      end: reservation.to,
      summary: "Reserva directa pagada",
    }));

  const manual = manualBlocks
    .filter((block) => dateRangesOverlap(input.from, input.to, block.from, block.to))
    .map((block) => ({
      source: "manual" as const,
      start: block.from,
      end: block.to,
      summary: block.reason,
    }));

  return [...airbnb, ...booking, ...direct, ...manual];
}

export async function loadExternalChannelReservations(input: {
  from: string;
  to: string;
}): Promise<{
  reservations: ExternalChannelReservation[];
  statuses: ExternalChannelStatus[];
}> {
  const items = await Promise.all(
    properties.flatMap((property) => {
      const channelEnv = PROPERTY_TO_CHANNEL_ENV[property.slug] ?? {};

      return (["airbnb", "booking"] as const).map(async (source) => {
        const envName = channelEnv[source];
        const url = envName ? process.env[envName] : undefined;
        const baseStatus = {
          propertySlug: property.slug,
          propertyTitle: property.shortTitle,
          source,
        };

        if (!url) {
          return {
            reservations: [] as ExternalChannelReservation[],
            status: { ...baseStatus, configured: false, events: 0 },
          };
        }

        try {
          const events = await fetchIcalBlockedEvents(url);
          const reservations = blockedEventsForRange(events, input.from, input.to).map((event) => ({
            id: `${property.slug}-${source}-${event.uid ?? event.start}-${event.end}`,
            propertySlug: property.slug,
            propertyTitle: property.shortTitle,
            source,
            start: event.start,
            end: event.end,
            summary: event.summary,
          }));
          return {
            reservations,
            status: {
              ...baseStatus,
              configured: true,
              events: reservations.length,
            },
          };
        } catch (error: any) {
          return {
            reservations: [] as ExternalChannelReservation[],
            status: {
              ...baseStatus,
              configured: true,
              events: 0,
              error: error?.message ?? "No fue posible leer el iCal",
            },
          };
        }
      });
    })
  );

  return {
    reservations: items
      .flatMap((item) => item.reservations)
      .sort((a, b) => a.start.localeCompare(b.start) || a.propertyTitle.localeCompare(b.propertyTitle)),
    statuses: items.map((item) => item.status),
  };
}

export async function listExternalChannelReservations(input: {
  from: string;
  to: string;
}): Promise<ExternalChannelReservation[]> {
  const data = await loadExternalChannelReservations(input);
  return data.reservations;
}
