import { randomBytes, randomUUID } from "node:crypto";
import { properties } from "../properties";
import { collectAvailabilityConflicts } from "../booking/availability";
import { quoteDirectStay } from "../booking/pricing";
import { DEPOSIT_PERCENT, QuotationError, colombiaToday, publicQuote, quoteLines, validatePaymentUrl, validateQuoteInput } from "./model";
import { findQuoteByToken, insertQuote } from "./store";

export async function prepareQuote(body: unknown, now = new Date()) {
  const input = validateQuoteInput(body, now);
  const property = properties.find((p) => p.slug === input.propertySlug);
  if (!property || input.guests > property.capacity) throw new QuotationError("Revisa la propiedad y su capacidad máxima.");
  const conflicts = await collectAvailabilityConflicts(input);
  if (conflicts.length) throw new QuotationError("La propiedad no está disponible para esas fechas. No se ha guardado una cotización.", 409);
  const calculation = await quoteDirectStay({ ...input, conflicts });
  const lines = quoteLines(calculation);
  const payNowCOP = input.payMode === "deposit" ? Math.round(calculation.totalCOP * DEPOSIT_PERCENT / 100) : calculation.totalCOP;
  const expiresAt = new Date(Math.min(now.getTime() + input.validityHours * 3600000,
    Date.parse(`${input.from}T23:59:59-05:00`))).toISOString();
  return { input, expiresAt, snapshot: {
    version: 1 as const, propertySlug: property.slug, propertyTitle: property.shortTitle,
    propertyImage: property.heroImage, location: property.locationLabel, guestName: input.guestName,
    from: input.from, to: input.to, guests: input.guests, nights: calculation.nights,
    extras: calculation.extras, lines, totalCOP: calculation.totalCOP,
    payMode: input.payMode, payNowCOP, balanceCOP: calculation.totalCOP - payNowCOP,
  } };
}
export async function issueQuote(body: unknown) {
  const now = new Date();
  const prepared = await prepareQuote(body, now);
  const expected = (body as Record<string, unknown>)?.expectedSnapshot;
  // Recalculate on the server, then require the administrator to have reviewed
  // this exact result. Browser totals never determine the amount charged.
  if (JSON.stringify(expected) !== JSON.stringify(prepared.snapshot)) {
    throw new QuotationError("La propuesta cambió. Calcula nuevamente la vista previa y verifica el importe antes de guardar.", 409);
  }
  const id = randomUUID();
  const number = `ALK-${colombiaToday(now).replace(/-/g, "")}-${id.slice(0, 8).toUpperCase()}`;
  return insertQuote({ id, number, shareToken: randomBytes(32).toString("base64url"),
    createdAt: now.toISOString(), expiresAt: prepared.expiresAt, revokedAt: null,
    snapshot: prepared.snapshot, paymentUrl: prepared.input.paymentUrl });
}
export async function viewQuote(token: string) {
  const quote = await findQuoteByToken(token);
  if (quote.revokedAt) throw new QuotationError("Esta cotización fue anulada. Solicita una nueva a Alkila.", 410);
  return publicQuote(quote);
}
export async function quotePaymentUrl(token: string) {
  const quote = await findQuoteByToken(token);
  if (publicQuote(quote).status !== "active" || quote.snapshot.from < colombiaToday()) throw new QuotationError("La cotización venció o fue anulada. Solicita una actualización antes de pagar.", 410);
  if (!quote.paymentUrl) throw new QuotationError("Esta cotización no incluye un enlace de pago.", 404);
  const conflicts = await collectAvailabilityConflicts({ propertySlug: quote.snapshot.propertySlug,
    from: quote.snapshot.from, to: quote.snapshot.to });
  if (conflicts.length) throw new QuotationError("Las fechas ya no están disponibles. Contacta a Alkila antes de pagar.", 409);
  // This only opens the administrator's existing payment link. It does not
  // create a reservation, modify payment status, or claim payment confirmation.
  const current = await findQuoteByToken(token);
  if (publicQuote(current).status !== "active" || current.revokedAt) throw new QuotationError("La cotización ya no está vigente.", 410);
  return validatePaymentUrl(current.paymentUrl);
}
