import { quotePaymentUrl } from "@/lib/quotations/service";
import { QuotationError } from "@/lib/quotations/model";
import { quoteError, quoteResponse, readQuoteBody } from "@/lib/quotations/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  try {
    const body = await readQuoteBody(req);
    if (typeof body.token !== "string") throw new QuotationError("Cotización no encontrada.", 404);
    return quoteResponse({ url: await quotePaymentUrl(body.token) });
  } catch (error) { return quoteError(error); }
}
