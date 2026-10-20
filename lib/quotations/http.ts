import { AdminAuthError } from "../admin/auth";
import { QuotationError } from "./model";
export function quoteResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: {
    "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff",
  } });
}
export async function readQuoteBody(req: Request): Promise<Record<string, unknown>> {
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new QuotationError("Se requiere un cuerpo JSON.", 415);
  const reader = req.body?.getReader();
  if (!reader) throw new QuotationError("Solicitud vacía.");
  const decoder = new TextDecoder();
  let text = "", size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 8192) { await reader.cancel(); throw new QuotationError("Solicitud demasiado grande.", 413); }
      text += decoder.decode(part.value, { stream: true });
    }
    text += decoder.decode();
  } finally { reader.releaseLock(); }
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new QuotationError("JSON inválido."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new QuotationError("Solicitud inválida.");
  return body as Record<string, unknown>;
}
export function quoteError(error: unknown) {
  if (error instanceof AdminAuthError) return quoteResponse({ error: "No autorizado. Ingresa nuevamente al panel." }, 401);
  if (error instanceof QuotationError) return quoteResponse({ error: error.message }, error.status);
  // The existing pricing engine uses plain Error for its validation messages.
  if (error instanceof Error && /^(La estadía mínima|La propiedad permite|Propiedad sin regla)/.test(error.message)) return quoteResponse({ error: error.message }, 422);
  return quoteResponse({ error: "No fue posible completar la operación. Verifica la conexión y vuelve a intentar." }, 503);
}
