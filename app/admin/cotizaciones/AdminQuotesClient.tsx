"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import QuoteCard from "@/components/quotations/QuoteCard";
import { properties } from "@/lib/properties";
import { EXTRA_OPTIONS, colombiaToday, formatCOP, formatDate, formatTimestamp, publicQuote, quoteShareUrl, type QuoteInput, type QuoteSnapshot, type SavedQuote } from "@/lib/quotations/model";
import type { DocumentQuote } from "@/lib/quotations/export";

type Preview = { snapshot: QuoteSnapshot; expiresAt: string };
const field = "mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-[#1F3D2B] outline-none focus:ring-2 focus:ring-[#8F3F2A]";
const primary = "rounded-xl bg-[#1F3D2B] px-4 py-3 font-semibold text-white disabled:opacity-50";
const secondary = "rounded-xl border border-stone-300 bg-white px-4 py-3 font-semibold text-[#1F3D2B] disabled:opacity-50";
export default function AdminQuotesClient() {
  const [token, setToken] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [selected, setSelected] = useState<SavedQuote | null>(null);
  const [origin, setOrigin] = useState("");
  const [clock, setClock] = useState(Date.now());
  const [draft, setDraft] = useState<QuoteInput>({
    propertySlug: properties[0].slug, from: "", to: "", guests: 2, extras: [], guestName: "",
    validityHours: 24, payMode: "deposit", paymentUrl: "", paymentAmountVerified: false,
  });
  const revision = useRef(0);
  const property = properties.find((p) => p.slug === draft.propertySlug)!;
  useEffect(() => {
    setOrigin(window.location.origin);
    const stored = window.sessionStorage.getItem("alkila_admin_token");
    if (stored) { setToken(stored); void load(stored); }
    const timer = window.setInterval(() => setClock(Date.now()), 60000);
    return () => clearInterval(timer);
    // A saved token is validated by the server, not trusted as authorization.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function api<T>(auth: string, method = "GET", body?: unknown): Promise<T> {
    const res = await fetch("/api/admin/quotes", { method, headers: { "x-admin-token": auth, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}), cache: "no-store" });
    const data = await res.json();
    if (res.status === 401) { setAuthorized(false); setQuotes([]); setSelected(null); setPreview(null); window.sessionStorage.removeItem("alkila_admin_token"); }
    if (!res.ok) throw new Error(data.error || "No fue posible completar la solicitud.");
    return data as T;
  }
  async function load(auth = token) {
    setBusy(true); setError("");
    try { const data = await api<{ quotes: SavedQuote[] }>(auth); setQuotes(data.quotes); setAuthorized(true); window.sessionStorage.setItem("alkila_admin_token", auth); }
    catch (e) { setError(e instanceof Error ? e.message : "No fue posible ingresar."); }
    finally { setBusy(false); }
  }
  function change(patch: Partial<QuoteInput>, pricing = true) {
    revision.current += 1;
    setDraft((current) => ({ ...current, ...patch, paymentAmountVerified: false }));
    setSelected(null); setError(""); setMessage("");
    if (pricing) setPreview(null);
  }
  async function calculate() {
    const current = revision.current; setBusy(true); setError(""); setMessage(""); setSelected(null); setPreview(null);
    try {
      const data = await api<Preview>(token, "POST", { ...draft, paymentUrl: "", paymentAmountVerified: false, action: "preview" });
      if (revision.current === current) { setPreview(data); setDraft((d) => ({ ...d, paymentAmountVerified: false })); }
    } catch (e) { if (revision.current === current) setError(e instanceof Error ? e.message : "No se pudo cotizar."); }
    finally { setBusy(false); }
  }
  async function issue() {
    if (!preview) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const data = await api<{ quote: SavedQuote }>(token, "POST", { ...draft, action: "issue", expectedSnapshot: preview.snapshot });
      setSelected(data.quote); setQuotes((items) => [data.quote, ...items].slice(0, 50)); setPreview(null);
      setMessage("Cotización guardada. Puedes descargarla o copiar su enlace. No se creó ninguna reserva.");
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar."); }
    finally { setBusy(false); }
  }
  async function revoke(quote: SavedQuote) {
    if (!window.confirm(`¿Anular ${quote.number}? Su enlace dejará de permitir consultar o continuar al pago. Los archivos ya enviados no pueden retirarse.`)) return;
    setBusy(true); setError("");
    try {
      await api(token, "PATCH", { action: "revoke", id: quote.id });
      const updated = { ...quote, revokedAt: new Date().toISOString() };
      setQuotes((items) => items.map((item) => item.id === quote.id ? updated : item));
      if (selected?.id === quote.id) setSelected(updated);
      setMessage("Cotización anulada. Su enlace ya no permite continuar al pago.");
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo anular."); }
    finally { setBusy(false); }
  }
  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); setMessage("Enlace copiado. Envíalo junto con la imagen o el PDF."); }
    catch { setMessage("Selecciona y copia el enlace que aparece debajo de la cotización."); }
  }
  const documentQuote = useMemo<DocumentQuote | null>(() => selected ? publicQuote(selected, new Date(clock)) : preview ? {
    number: "BORRADOR", createdAt: new Date().toISOString(), expiresAt: preview.expiresAt,
    snapshot: preview.snapshot, hasPaymentLink: false, status: "active",
  } : null, [selected, preview, clock]);
  const shareUrl = selected && origin ? quoteShareUrl(origin, selected.shareToken) : "";
  const today = colombiaToday(new Date(clock));
  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-7 text-[#1F3D2B] sm:px-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-widest text-[#8F3F2A]">Panel administrativo</p><h1 className="mt-1 text-3xl font-bold">Cotizaciones</h1><p className="mt-2 text-sm text-gray-600">Prepara, guarda y comparte una propuesta sin crear una reserva.</p></div>
      <Link href="/admin" className={secondary}>Volver al panel</Link>
    </header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-green-50 p-4">{message}</p>}
    {!authorized ? <form onSubmit={(e) => { e.preventDefault(); void load(); }} className="max-w-lg space-y-4 rounded-2xl border bg-white p-6">
      <h2 className="text-xl font-semibold">Acceso de administración</h2>
      <label className="block text-sm font-semibold">Token del panel<input type="password" required value={token} onChange={(e) => setToken(e.target.value)} autoComplete="current-password" className={field} /></label>
      <button className={primary} disabled={busy} type="submit">{busy ? "Verificando..." : "Ingresar"}</button>
    </form> : <>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Nueva cotización</h2>
          <form onSubmit={(e) => { e.preventDefault(); void calculate(); }}>
            <fieldset disabled={busy} className="space-y-4 disabled:opacity-70">
              <label className="block text-sm font-semibold">Propiedad<select className={field} value={draft.propertySlug} onChange={(e) => { const p = properties.find((x) => x.slug === e.target.value)!; change({ propertySlug: p.slug, guests: Math.min(draft.guests, p.capacity) }); }}>{properties.map((p) => <option value={p.slug} key={p.slug}>{p.shortTitle}</option>)}</select></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="min-w-0 text-sm font-semibold">Ingreso<input className={field} type="date" required min={today} value={draft.from} onChange={(e) => change({ from: e.target.value })} /></label>
                <label className="min-w-0 text-sm font-semibold">Salida<input className={field} type="date" required min={draft.from || today} value={draft.to} onChange={(e) => change({ to: e.target.value })} /></label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">Huéspedes<input className={field} type="number" required min={1} max={property.capacity} step={1} value={draft.guests} onChange={(e) => change({ guests: Number(e.target.value) })} /></label>
                <label className="text-sm font-semibold">Vigencia (horas)<input className={field} type="number" required min={1} max={168} step={1} value={draft.validityHours} onChange={(e) => change({ validityHours: Number(e.target.value) })} /></label>
              </div>
              <label className="block text-sm font-semibold">Nombre del huésped (opcional)<input className={field} type="text" maxLength={60} value={draft.guestName} onChange={(e) => change({ guestName: e.target.value })} placeholder="Nombre para personalizar el documento" /></label>
              <fieldset className="rounded-xl bg-stone-50 p-4"><legend className="px-1 text-sm font-semibold">Adicionales</legend><div className="grid gap-3 sm:grid-cols-2">{EXTRA_OPTIONS.map((option) => <label key={option.value} className="flex items-start gap-2 text-sm"><input className="mt-1 h-4 w-4" type="checkbox" checked={draft.extras.includes(option.value)} onChange={(e) => change({ extras: e.target.checked ? [...draft.extras, option.value] : draft.extras.filter((x) => x !== option.value) })} />{option.label}</label>)}</div></fieldset>
              <label className="block text-sm font-semibold">Forma de pago<select className={field} value={draft.payMode} onChange={(e) => change({ payMode: e.target.value as QuoteInput["payMode"] })}><option value="deposit">Anticipo del 30 % y saldo restante</option><option value="full">Pago completo</option></select></label>
              <button type="submit" className={`${secondary} w-full`}>{busy ? "Consultando..." : "Calcular vista previa"}</button>
            </fieldset>
          </form>
          <p className="text-xs text-gray-600">Se usan las tarifas guardadas y la disponibilidad de Alkila. No se cambian precios, reservas ni bloqueos. La vigencia máxima es de 7 días, sin superar el día de ingreso.</p>
          {preview && <fieldset disabled={busy} className="space-y-3 border-t border-stone-200 pt-5">
            <p className="font-semibold">Total: {formatCOP(preview.snapshot.totalCOP)} · A pagar: {formatCOP(preview.snapshot.payNowCOP)}</p>
            <label className="block text-sm font-semibold">Enlace de pago existente (opcional)<input type="url" className={field} value={draft.paymentUrl} placeholder="https://mpago.li/..." onChange={(e) => change({ paymentUrl: e.target.value }, false)} /></label>
            <p className="text-xs text-gray-600">Pega un enlace que ya hayas creado en Mercado Pago o Wompi. Este módulo no genera cobros automáticos. Usa un enlace específico para esta propuesta, con importe fijo y la misma vigencia; valida el pago antes de confirmar la reserva.</p>
            {draft.paymentUrl && <label className="flex gap-2 rounded-xl bg-orange-50 p-3 text-sm"><input className="mt-1 h-4 w-4 shrink-0" type="checkbox" checked={draft.paymentAmountVerified} onChange={(e) => setDraft((d) => ({ ...d, paymentAmountVerified: e.target.checked }))} />He verificado que el enlace corresponde a esta cotización y cobra exactamente {formatCOP(preview.snapshot.payNowCOP)}.</label>}
            <button className={`${primary} w-full`} type="button" disabled={busy || (!!draft.paymentUrl && !draft.paymentAmountVerified)} onClick={issue}>{busy ? "Guardando..." : "Guardar cotización"}</button>
          </fieldset>}
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{selected ? selected.number : "Vista previa"}</h2>
          {documentQuote ? <QuoteCard quote={documentQuote} shareUrl={shareUrl || undefined} draft={!selected} /> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white/80 p-10 text-center text-gray-600">Selecciona la estadía y calcula su valor. Aquí aparecerá la cotización con el logo y la foto original.</div>}
          {selected && shareUrl && <div className="space-y-3 rounded-xl border bg-white p-4">
            {documentQuote?.status !== "active" && <p className="font-semibold text-red-800">Esta cotización está {selected.revokedAt ? "anulada" : "vencida"}.</p>}
            <div className="flex flex-wrap gap-2"><button type="button" className={primary} onClick={() => copy(shareUrl)}>Copiar enlace</button><a href={shareUrl} target="_blank" rel="noopener noreferrer" className={secondary}>Abrir como huésped</a></div>
            <label className="block text-xs text-gray-600">Enlace privado para compartir<input readOnly value={shareUrl} onFocus={(e) => e.target.select()} className={field} /></label>
            <p className="text-xs text-gray-600">Cualquier persona que reciba este enlace puede ver la propuesta. No contiene tu token de administración. La imagen no es clicable; pega también el enlace en WhatsApp.</p>
          </div>}
        </section>
      </div>
      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Cotizaciones recientes</h2><button type="button" disabled={busy} className={secondary} onClick={() => load()}>Actualizar</button></div>
        <p className="text-xs text-gray-600">Últimas 50 cotizaciones. Los importes quedan guardados como fueron emitidos.</p>
        {!quotes.length && <p className="py-4 text-gray-600">Todavía no has generado cotizaciones.</p>}
        <div className="divide-y divide-stone-200">{quotes.map((quote) => {
          const status = publicQuote(quote, new Date(clock)).status;
          return <article key={quote.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div><p className="text-xs font-bold text-[#8F3F2A]">{quote.number} · {status === "active" ? "Vigente" : status === "expired" ? "Vencida" : "Anulada"}</p><h3 className="mt-1 font-semibold">{quote.snapshot.propertyTitle}{quote.snapshot.guestName ? ` · ${quote.snapshot.guestName}` : ""}</h3><p className="text-sm text-gray-600">{formatDate(quote.snapshot.from)} — {formatDate(quote.snapshot.to)} · {formatCOP(quote.snapshot.totalCOP)}</p><p className="mt-1 text-xs text-gray-500">Vence: {formatTimestamp(quote.expiresAt)}</p></div>
            <div className="flex gap-2"><button type="button" disabled={busy} onClick={() => { setSelected(quote); setPreview(null); setMessage(""); setError(""); }} className={secondary}>Ver / descargar</button>{!quote.revokedAt && <button type="button" disabled={busy} onClick={() => revoke(quote)} className="px-3 text-sm font-semibold text-red-800 underline">Anular</button>}</div>
          </article>;
        })}</div>
      </section>
    </>}
  </main>;
}
