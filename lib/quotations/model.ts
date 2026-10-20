import type { BookingExtra, QuoteResult } from "../booking/types";

export const EXTRA_OPTIONS: { value: BookingExtra; label: string }[] = [
  { value: "pets", label: "Mascotas" },
  { value: "domestic_service", label: "Servicio doméstico" },
  { value: "early_checkin", label: "Ingreso anticipado" },
  { value: "late_checkout", label: "Salida tardía" },
];
export const DEPOSIT_PERCENT = 30;
export type PayMode = "deposit" | "full";
export type QuoteInput = {
  propertySlug: string; from: string; to: string; guests: number;
  extras: BookingExtra[]; guestName: string; validityHours: number;
  payMode: PayMode; paymentUrl: string; paymentAmountVerified: boolean;
};
export type QuoteLine = { label: string; amountCOP: number };
export type QuoteSnapshot = {
  version: 1; propertySlug: string; propertyTitle: string; propertyImage: string;
  location: string; guestName: string; from: string; to: string; guests: number;
  nights: number; extras: BookingExtra[]; lines: QuoteLine[]; totalCOP: number;
  payMode: PayMode; payNowCOP: number; balanceCOP: number;
};
export type SavedQuote = {
  id: string; number: string; shareToken: string; createdAt: string;
  expiresAt: string; revokedAt: string | null; snapshot: QuoteSnapshot;
  paymentUrl: string;
};
export type PublicQuote = Omit<SavedQuote, "shareToken" | "paymentUrl"> & {
  hasPaymentLink: boolean; status: "active" | "expired" | "revoked";
};
export class QuotationError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message); this.name = "QuotationError";
  }
}
export function colombiaToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function isYMD(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}
export function validatePaymentUrl(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string" || value.length > 2048) throw new QuotationError("Enlace de pago inválido.");
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new QuotationError("Ingresa un enlace de pago HTTPS válido."); }
  // Exact/suffix boundary checks, never arbitrary URLs or userinfo redirects.
  const hosts = ["mercadopago.com.co", "mercadopago.com", "mpago.li", "checkout.wompi.co", "checkout.wompi.com"];
  const allowed = hosts.some((host) => url.hostname === host ||
    (host.startsWith("mercadopago.") && url.hostname.endsWith(`.${host}`)));
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443") || !allowed) {
    throw new QuotationError("Usa un enlace HTTPS de Mercado Pago o del checkout de Wompi.");
  }
  return url.href;
}
export function validateQuoteInput(value: unknown, now = new Date()): QuoteInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new QuotationError("Datos de cotización inválidos.");
  const b = value as Record<string, unknown>;
  if (typeof b.propertySlug !== "string" || !/^[a-z0-9-]{1,100}$/.test(b.propertySlug)) throw new QuotationError("Selecciona una propiedad.");
  if (!isYMD(b.from) || !isYMD(b.to) || b.to <= b.from) throw new QuotationError("Selecciona fechas reales; la salida debe ser posterior al ingreso.");
  if (b.from < colombiaToday(now)) throw new QuotationError("La fecha de ingreso no puede estar en el pasado.");
  const nights = (Date.parse(`${b.to}T00:00:00Z`) - Date.parse(`${b.from}T00:00:00Z`)) / 86400000;
  if (nights > 90) throw new QuotationError("Cotiza un máximo de 90 noches por documento.");
  if (!Number.isInteger(b.guests) || Number(b.guests) < 1 || Number(b.guests) > 100) throw new QuotationError("Ingresa una cantidad entera de huéspedes.");
  const rawExtras = b.extras ?? [];
  if (!Array.isArray(rawExtras) || rawExtras.length > 4 || rawExtras.some((extra) => !EXTRA_OPTIONS.some((option) => option.value === extra))) throw new QuotationError("Los adicionales seleccionados no son válidos.");
  const guestName = b.guestName ?? "";
  if (typeof guestName !== "string" || guestName.trim().length > 60 || /[\x00-\x1F\x7F]/.test(guestName)) throw new QuotationError("El nombre debe tener hasta 60 caracteres y no incluir saltos de línea.");
  const validityHours = b.validityHours ?? 24;
  if (!Number.isInteger(validityHours) || Number(validityHours) < 1 || Number(validityHours) > 168) throw new QuotationError("La vigencia debe estar entre 1 y 168 horas.");
  const payMode = b.payMode ?? "deposit";
  if (payMode !== "deposit" && payMode !== "full") throw new QuotationError("Modalidad de pago inválida.");
  const paymentUrl = validatePaymentUrl(b.paymentUrl);
  if (paymentUrl && b.paymentAmountVerified !== true) throw new QuotationError("Confirma que el enlace de pago corresponde a esta cotización y al importe a pagar.");
  return { propertySlug: b.propertySlug, from: b.from, to: b.to, guests: Number(b.guests),
    extras: [...new Set(rawExtras)] as BookingExtra[], guestName: guestName.trim(),
    validityHours: Number(validityHours), payMode, paymentUrl, paymentAmountVerified: b.paymentAmountVerified === true };
}
export function quoteLines(q: QuoteResult): QuoteLine[] {
  const rows: QuoteLine[] = [
    { label: `Alojamiento (${q.nights} ${q.nights === 1 ? "noche" : "noches"})`, amountCOP: q.subtotalCOP },
    { label: "Limpieza", amountCOP: q.cleaningFeeCOP },
  ];
  if (q.extraGuestFeeCOP > 0) rows.push({ label: "Huéspedes adicionales", amountCOP: q.extraGuestFeeCOP });
  const extras: [BookingExtra, string, number][] = [
    ["pets", "Mascotas", q.petFeeCOP],
    ["domestic_service", `Servicio doméstico (${q.nights} ${q.nights === 1 ? "día" : "días"})`, q.domesticServiceFeeCOP],
    ["early_checkin", "Ingreso anticipado", q.earlyCheckInFeeCOP],
    ["late_checkout", "Salida tardía", q.lateCheckoutFeeCOP],
  ];
  for (const [extra, label, amountCOP] of extras) if (q.extras.includes(extra)) rows.push({ label, amountCOP });
  if (rows.some((line) => !Number.isSafeInteger(line.amountCOP) || line.amountCOP < 0) ||
      !Number.isSafeInteger(q.totalCOP) || q.totalCOP <= 0 || q.totalCOP > 1_000_000_000 ||
      rows.reduce((sum, row) => sum + row.amountCOP, 0) !== q.totalCOP) {
    throw new QuotationError("Revisa las reglas de precios: el desglose no coincide con el total.", 422);
  }
  return rows;
}
export function publicQuote(quote: SavedQuote, now = new Date()): PublicQuote {
  const { shareToken: _token, paymentUrl, ...visible } = quote;
  void _token;
  return { ...visible, hasPaymentLink: Boolean(paymentUrl), status: quote.revokedAt ? "revoked" : Date.parse(quote.expiresAt) <= now.getTime() ? "expired" : "active" };
}
export function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Bogota" }).format(new Date(`${value}T12:00:00-05:00`));
}
export function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" }).format(new Date(value));
}
export function quoteShareUrl(origin: string, token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new QuotationError("Enlace de cotización inválido.");
  // Fragment is not sent to the web server, referrers or access logs.
  return `${new URL(origin).origin}/cotizacion#${token}`;
}
