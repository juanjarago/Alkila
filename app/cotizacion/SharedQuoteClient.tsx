"use client";
import { useEffect, useMemo, useState } from "react";
import QuoteCard from "@/components/quotations/QuoteCard";
import { formatCOP, type PublicQuote } from "@/lib/quotations/model";
export default function SharedQuoteClient() {
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    let controller: AbortController | undefined;
    function loadQuote() {
      controller?.abort();
      const pending = new AbortController(); controller = pending;
      const value = window.location.hash.slice(1);
      setQuote(null); setError(""); setLoading(true); setPaying(false); setToken("");
      if (!/^[A-Za-z0-9_-]{43}$/.test(value)) { setError("El enlace de cotización está incompleto. Solicítalo nuevamente a Alkila."); setLoading(false); return; }
      setToken(value); setShareUrl(window.location.href);
      fetch("/api/quotes/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: value }), cache: "no-store", signal: pending.signal })
        .then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error || "No se pudo consultar la cotización."); if (!pending.signal.aborted) setQuote(data.quote); })
        .catch((e: unknown) => { if (!pending.signal.aborted) setError(e instanceof Error ? e.message : "No fue posible consultar."); })
        .finally(() => { if (!pending.signal.aborted) setLoading(false); });
    }
    loadQuote(); window.addEventListener("hashchange", loadQuote);
    const timer = window.setInterval(() => setClock(Date.now()), 30000);
    return () => { controller?.abort(); clearInterval(timer); window.removeEventListener("hashchange", loadQuote); };
  }, []);
  const visible = useMemo(() => quote ? { ...quote, status: Date.parse(quote.expiresAt) <= clock ? "expired" as const : quote.status } : null, [quote, clock]);
  async function pay() {
    setPaying(true); setError("");
    try {
      const res = await fetch("/api/quotes/payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }), cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No fue posible abrir el pago.");
      if (window.location.hash.slice(1) !== token) throw new Error("La cotización cambió. Revisa la nueva propuesta antes de pagar.");
      window.location.assign(data.url);
    } catch (e) { setError(e instanceof Error ? e.message : "No fue posible continuar."); setPaying(false); }
  }
  return <main className="mx-auto max-w-[600px] space-y-4 px-4 py-6 text-[#1F3D2B]">
    <h1 className="text-2xl font-bold">Tu cotización</h1>
    {loading && <p role="status">Consultando la propuesta de Alkila...</p>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
    {visible && <>
      {visible.status !== "active" && <p className="rounded-xl bg-orange-50 p-4">Esta cotización ya no está vigente. Solicita una actualización a Alkila antes de pagar.</p>}
      <QuoteCard quote={visible} shareUrl={shareUrl} />
      {visible.hasPaymentLink && visible.status === "active" && <button type="button" disabled={paying} onClick={pay} className="w-full rounded-xl bg-[#8F3F2A] px-4 py-4 text-lg font-bold text-white disabled:opacity-50">{paying ? "Verificando disponibilidad..." : `Pagar ${visible.snapshot.payMode === "deposit" ? "anticipo" : "total"} ${formatCOP(visible.snapshot.payNowCOP)}`}</button>}
      <div className="space-y-2 rounded-xl border bg-white p-4 text-sm text-gray-700"><p>Cotizar no bloquea fechas ni confirma una reserva. Antes de continuar al pago comprobamos la vigencia y la disponibilidad registrada.</p><p>{visible.hasPaymentLink ? "Al abrir el proveedor, verifica el importe y el destinatario. Comparte el comprobante con Alkila para validar el pago y confirmar la reserva." : "Para reservar, contacta a la persona de Alkila que te envió esta propuesta."}</p></div>
    </>}
  </main>;
}
