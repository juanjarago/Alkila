import { QuotationError, type SavedQuote, type QuoteSnapshot } from "./model";

type Row = { id: string; quote_number: string; share_token: string; created_at: string;
  expires_at: string; revoked_at: string | null; snapshot: QuoteSnapshot; payment_url: string | null };
function fromRow(row: Row): SavedQuote {
  return { id: row.id, number: row.quote_number, shareToken: row.share_token,
    createdAt: row.created_at, expiresAt: row.expires_at, revokedAt: row.revoked_at,
    snapshot: row.snapshot, paymentUrl: row.payment_url ?? "" };
}
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // No ephemeral fallback: an issued quotation must survive server restarts.
  if (!url || !key) throw new QuotationError("Configura Supabase en el servidor para guardar cotizaciones.", 503);
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...init, cache: "no-store", signal: AbortSignal.timeout(15000),
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" },
  });
  if (!res.ok) throw new QuotationError("No fue posible acceder al historial de cotizaciones. Verifica la migración admin_quotes y los permisos del servidor.", 503);
  return res.json() as Promise<T>;
}
export async function insertQuote(q: SavedQuote) {
  const rows = await request<Row[]>("admin_quotes", { method: "POST", body: JSON.stringify({
    id: q.id, quote_number: q.number, share_token: q.shareToken, created_at: q.createdAt,
    expires_at: q.expiresAt, revoked_at: null, snapshot: q.snapshot, payment_url: q.paymentUrl || null,
  }) });
  if (!rows[0]) throw new QuotationError("La cotización no se guardó. Intenta nuevamente.", 503);
  return fromRow(rows[0]);
}
export async function listQuotes() {
  const rows = await request<Row[]>("admin_quotes?select=*&order=created_at.desc&limit=50");
  return rows.map(fromRow);
}
export async function findQuoteByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new QuotationError("Cotización no encontrada.", 404);
  const rows = await request<Row[]>(`admin_quotes?share_token=eq.${encodeURIComponent(token)}&select=*&limit=1`);
  if (!rows[0]) throw new QuotationError("Cotización no encontrada.", 404);
  return fromRow(rows[0]);
}
export async function revokeQuote(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new QuotationError("Cotización inválida.");
  const rows = await request<Row[]>(`admin_quotes?id=eq.${id}&revoked_at=is.null`, {
    method: "PATCH", body: JSON.stringify({ revoked_at: new Date().toISOString() }),
  });
  return rows[0] ? fromRow(rows[0]) : null;
}
