"use client";

import { useMemo, useState } from "react";

type PropertyLike = {
  title: string;
  capacity: number;
  staysListingId: string;
  slug?: string;
};

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BookingBox({
  property,
  extras = [],
}: {
  property: PropertyLike;
  extras?: string[];
}) {
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(Math.min(8, property.capacity));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const canSearch = useMemo(() => {
    if (!checkIn || !checkOut) return false;
    if (!Number.isFinite(guests) || guests <= 0) return false;
    if (new Date(checkOut) <= new Date(checkIn)) return false;
    return true;
  }, [checkIn, checkOut, guests]);

  async function onSearch() {
    setError("");
    setResult(null);

    if (!checkIn || !checkOut) {
      setError("Completa check-in y check-out.");
      return;
    }

    const today = new Date(minDate);
    today.setHours(0, 0, 0, 0);

    const inDate = new Date(checkIn);
    inDate.setHours(0, 0, 0, 0);

    if (inDate < today) {
      setError("No puedes reservar en fechas pasadas.");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError("Check-out debe ser posterior a check-in.");
      return;
    }

    if (!Number.isFinite(guests) || guests <= 0) {
      setError("Ingresa un número válido de personas.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        propertySlug: property.slug,
        from: checkIn,
        to: checkOut,
        guests,
      };

      const res = await fetch("/api/booking/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();

      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = { message: raw };
      }

      if (!res.ok) {
        setError(
          data?.error ||
            data?.message ||
            `Error consultando disponibilidad (${res.status})`
        );
        return;
      }

      setResult(data);
    } catch (e: any) {
      setError(e?.message ?? "Error inesperado consultando disponibilidad");
    } finally {
      setLoading(false);
    }
  }

  const stays = useMemo(() => {
    if (!result) return null;

    return {
      totalCOP: result?.totalCOP ?? null,
      totalUSD: null,
      currency: "COP",
      nights: result?.nights ?? null,
      subtotalCOP: result?.subtotalCOP ?? null,
      cleaningFeeCOP: result?.cleaningFeeCOP ?? null,
      extraGuestFeeCOP: result?.extraGuestFeeCOP ?? null,
    };
  }, [result]);

  const whatsappHref = useMemo(() => {
    if (!result) return "";

    const extrasText =
      extras.length > 0 ? `\nExtras:\n- ${extras.join("\n- ")}` : "";

    const totalCOPText =
      stays?.totalCOP != null ? formatCOP(Number(stays.totalCOP)) : "N/D";

    const totalUSDText =
      stays?.totalUSD != null ? formatUSD(Number(stays.totalUSD)) : "N/D";

    const whatsappMessage = `Hola.
Estoy interesado en ${property.title} en Anapoima.

Fechas: ${checkIn} a ${checkOut}
Personas: ${guests}
Valor estimado: ${totalCOPText}${
      stays?.totalUSD != null ? ` (${totalUSDText})` : ""
    }${extrasText}

Me ayudas a confirmar disponibilidad y el proceso para reservar?`;

    const phone = "573014000436";
    return `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
  }, [result, extras, stays, property.title, checkIn, checkOut, guests]);

  return (
    <div className="rounded-[2rem] border border-[#C6C0B1] bg-[#F4EFE2] p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="max-w-[13rem] text-lg font-black leading-tight text-[#17332A]">
          Consulta tu estadía
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-[#17332A]">
          Reserva segura
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-[#4B544D]">
        Selecciona fechas y número de personas para ver disponibilidad y precio
        estimado.
      </p>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-3">
          <label className="min-w-0 text-sm font-bold text-[#17332A]">
            Check-in
            <input
              type="date"
              min={minDate}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-1 min-h-12 w-full min-w-0 appearance-none rounded-2xl border border-[#C6C0B1] bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#B8794A]"
            />
          </label>

          <label className="min-w-0 text-sm font-bold text-[#17332A]">
            Check-out
            <input
              type="date"
              min={checkIn || minDate}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 min-h-12 w-full min-w-0 appearance-none rounded-2xl border border-[#C6C0B1] bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#B8794A]"
            />
          </label>
        </div>

        <label className="text-sm font-bold text-[#17332A]">
          Personas
          <input
            type="number"
            min={1}
            max={property.capacity ?? 50}
            value={guests}
            onChange={(e) => {
              const n = Number(e.target.value);
              setGuests(Number.isFinite(n) ? n : 0);
            }}
            className="mt-1 min-h-12 w-full rounded-2xl border border-[#C6C0B1] bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#B8794A]"
          />
        </label>

        <button
          type="button"
          onClick={onSearch}
          disabled={loading || !canSearch}
          className="w-full rounded-2xl bg-[#B85F3B] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Consultando..." : "Ver disponibilidad"}
        </button>

        {error ? (
          <div className="break-words rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {result && stays ? (
          <>
            <div className="rounded-2xl border border-[#C6C0B1] bg-white/72 p-3 text-sm text-[#3F4741]">
              <div className="space-y-1">
                {stays.totalUSD != null && (
                  <div>
                    <span className="font-semibold">Total USD:</span>{" "}
                    {formatUSD(Number(stays.totalUSD))}
                  </div>
                )}
                {stays.totalCOP != null && (
                  <div>
                    <span className="font-semibold">Total COP:</span>{" "}
                    {formatCOP(Number(stays.totalCOP))}
                  </div>
                )}
                {stays.nights != null && (
                  <div className="pt-2 text-xs text-[#4B544D]">
                    {stays.nights} noche{Number(stays.nights) === 1 ? "" : "s"}
                  </div>
                )}
                {stays.subtotalCOP != null && (
                  <div className="text-xs text-[#4B544D]">
                    Estadía: {formatCOP(Number(stays.subtotalCOP))}
                  </div>
                )}
                {stays.cleaningFeeCOP != null &&
                  Number(stays.cleaningFeeCOP) > 0 && (
                    <div className="text-xs text-[#4B544D]">
                      Limpieza: {formatCOP(Number(stays.cleaningFeeCOP))}
                    </div>
                  )}
                {stays.extraGuestFeeCOP != null &&
                  Number(stays.extraGuestFeeCOP) > 0 && (
                    <div className="text-xs text-[#4B544D]">
                      Huéspedes adicionales:{" "}
                      {formatCOP(Number(stays.extraGuestFeeCOP))}
                    </div>
                  )}
              </div>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block w-full rounded-2xl bg-[#66752F] px-4 py-3 text-center text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              Confirmar por WhatsApp
            </a>

            <a
              href={`/checkout?slug=${encodeURIComponent(
                property.slug ?? ""
              )}&title=${encodeURIComponent(property.title)}&checkIn=${encodeURIComponent(
                checkIn
              )}&checkOut=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(
                String(guests)
              )}&totalCOP=${encodeURIComponent(String(stays.totalCOP ?? 0))}`}
              className="mt-3 block w-full rounded-2xl bg-[#17332A] px-4 py-3 text-center text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              Pagar anticipo y reservar
            </a>
          </>
        ) : (
          <div className="mt-3 rounded-2xl border border-[#C6C0B1] bg-white p-3 text-xs text-[#4B544D]">
            Para continuar, primero consulta la disponibilidad.
          </div>
        )}
      </div>
    </div>
  );
}
