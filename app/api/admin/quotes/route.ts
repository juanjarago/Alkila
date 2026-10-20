import { assertAdmin } from "@/lib/admin/auth";
import { QuotationError } from "@/lib/quotations/model";
import { issueQuote, prepareQuote } from "@/lib/quotations/service";
import { listQuotes, revokeQuote } from "@/lib/quotations/store";
import { quoteError, quoteResponse, readQuoteBody } from "@/lib/quotations/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try { assertAdmin(req); return quoteResponse({ quotes: await listQuotes() }); }
  catch (error) { return quoteError(error); }
}
export async function POST(req: Request) {
  try {
    assertAdmin(req);
    const body = await readQuoteBody(req);
    if (body.action === "preview") {
      const prepared = await prepareQuote(body);
      return quoteResponse({ snapshot: prepared.snapshot, expiresAt: prepared.expiresAt });
    }
    if (body.action !== "issue") throw new QuotationError("Acción de cotización inválida.");
    return quoteResponse({ quote: await issueQuote(body) }, 201);
  } catch (error) { return quoteError(error); }
}
export async function PATCH(req: Request) {
  try {
    assertAdmin(req); const body = await readQuoteBody(req);
    if (body.action !== "revoke" || typeof body.id !== "string") throw new QuotationError("Acción inválida.");
    await revokeQuote(body.id); return quoteResponse({ ok: true });
  } catch (error) { return quoteError(error); }
}
