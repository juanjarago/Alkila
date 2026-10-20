"use client";
import { useEffect, useState } from "react";
import { formatCOP, formatDate } from "@/lib/quotations/model";
import { canvasBlob, downloadBlob, pdfBlob, renderQuotation, type DocumentQuote } from "@/lib/quotations/export";
export default function QuoteCard({ quote, shareUrl, draft = false }: { quote: DocumentQuote; shareUrl?: string; draft?: boolean }) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false; setCanvas(null); setImage(""); setError("");
    renderQuotation(quote, draft).then((result) => {
      if (!cancelled) { setCanvas(result); setImage(result.toDataURL("image/png")); }
    }).catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : "No se pudo dibujar la cotización."); });
    return () => { cancelled = true; };
  }, [quote, draft, attempt]);
  async function download(kind: "png" | "pdf") {
    if (!canvas) return;
    setWorking(true); setError("");
    try { downloadBlob(kind === "png" ? await canvasBlob(canvas) : await pdfBlob(canvas, shareUrl), `${quote.number}.${kind}`); }
    catch (e) { setError(e instanceof Error ? e.message : "Error al descargar."); }
    finally { setWorking(false); }
  }
  return <div className="space-y-3">
    {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error} <button type="button" onClick={() => setAttempt((n) => n + 1)} className="underline">Reintentar</button></div>}
    {!image && !error && <p role="status" className="rounded-xl bg-white p-6 text-sm">Preparando el logo y la foto original...</p>}
    {image && <img src={image} width={1080} height={1920} className="mx-auto h-auto w-full max-w-[540px] rounded-xl border border-stone-200 shadow-sm" alt={`Cotización ${quote.number}: ${quote.snapshot.propertyTitle}, del ${formatDate(quote.snapshot.from)} al ${formatDate(quote.snapshot.to)}, ${quote.snapshot.guests} huéspedes, total ${formatCOP(quote.snapshot.totalCOP)}.`} />}
    <div className="sr-only">
      <h3>{quote.snapshot.propertyTitle}</h3>
      <p>{quote.snapshot.nights} noches, {quote.snapshot.guests} huéspedes.</p>
      {quote.snapshot.lines.map((line) => <p key={line.label}>{line.label}: {formatCOP(line.amountCOP)}</p>)}
      <p>Total: {formatCOP(quote.snapshot.totalCOP)}. Anticipo o pago total: {formatCOP(quote.snapshot.payNowCOP)}. Saldo: {formatCOP(quote.snapshot.balanceCOP)}.</p>
    </div>
    {!draft && <div className="grid grid-cols-2 gap-2">
      <button type="button" disabled={!canvas || working} onClick={() => download("png")} className="rounded-xl bg-[#1F3D2B] px-3 py-3 font-semibold text-white disabled:opacity-50">Descargar imagen</button>
      <button type="button" disabled={!canvas || working} onClick={() => download("pdf")} className="rounded-xl border border-[#1F3D2B] bg-white px-3 py-3 font-semibold text-[#1F3D2B] disabled:opacity-50">Descargar PDF</button>
    </div>}
    {!draft && <p className="text-xs text-gray-600">Imagen 1080 × 1920. PDF vertical de una página con enlace clicable. Al enviar la imagen, acompáñala con el enlace de la cotización.</p>}
  </div>;
}
