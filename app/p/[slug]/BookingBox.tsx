"use client";

import { useMemo, useState } from "react";

type PropertyLike = {
  title: string;
  capacity: number;
  staysListingId: string; // "JF02" | "JF06" | "JF08"
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

export default function BookingBox({ property }: { property: PropertyLike }) {
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(Math.min(8, property.capacity));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<any>(null);

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
        from: checkIn,
        to: checkOut,
        listingIds: [property.staysListingId],
        guests,
      };

      const res = await fetch("/api/reserva/calcular-precio", {
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

    // STAYS devuelve array: [ { ... } ]
    const first = Array.isArray(result) ? result[0] : result;
    if (!first) return null;

    const totalCOP = first?._mctotal?.COP ?? null;
    const totalUSD = first?._mctotal?.USD ?? null;

    const fees = Array.isArray(first?.fees)
      ? first.fees.map((f: any) => ({
          name:
            f?._mstitle?.es_ES ??
            f?._mstitle?.en_US ??
            f?.internalName ??
            "Cargo",
          cop: f?._mcval?.COP ?? null,
          usd: f?._mcval?.USD ?? null,
        }))
      : [];

    return {
      totalCOP,
      totalUSD,
      fees,
      currency: first?.mainCurrency ?? null,
      raw: first,
    };
  }, [result]);

  return (
    <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-lg font-extrabold text-gray-900">
          Consulta tu estadía
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
          Reserva segura
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Selecciona fechas y número de personas para ver disponibilidad y precio
        estimado.
      </p>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-gray-700">
            Check-in
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </label>

          <label className="text-sm font-semibold text-gray-700">
            Check-out
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </label>
        </div>

        <label className="text-sm font-semibold text-gray-700">
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
            className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
          />
        </label>

        <button
          type="button"
          onClick={onSearch}
          disabled={loading || !canSearch}
          className="w-full rounded-2xl bg-[#E76F51] px-4 py-3 text-sm font-extrabold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Consultando..." : "Ver disponibilidad"}
        </button>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 break-words">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-gray-800">
            <div className="font-bold">Respuesta STAYS:</div>

            {stays?.totalCOP != null || stays?.totalUSD != null ? (
              <div className="mt-2 space-y-1">
                {stays?.totalUSD != null && (
                  <div>
                    <span className="font-semibold">Total USD:</span>{" "}
                    {formatUSD(Number(stays.totalUSD))}
                  </div>
                )}

                {stays?.totalCOP != null && (
                  <div>
                    <span className="font-semibold">Total COP:</span>{" "}
                    {formatCOP(Number(stays.totalCOP))}
                  </div>
                )}

                {stays?.fees?.length > 0 && (
                  <div className="mt-3">
                    <div className="font-semibold text-gray-900">Desglose</div>

                    <div className="mt-2 space-y-2">
                      {stays.fees.map((f: any, idx: number) => (
                        <div
                          key={`${f.name}-${idx}`}
                          className="flex items-start justify-between gap-3 rounded-lg bg-white/70 p-2"
                        >
                          <div className="text-gray-800">{f.name}</div>

                          <div className="text-right text-gray-900">
                            {f.usd != null && (
                              <div className="font-semibold">
                                {formatUSD(Number(f.usd))}
                              </div>
                            )}
                            {f.cop != null && (
                              <div className="text-xs text-gray-600">
                                {formatCOP(Number(f.cop))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <pre className="mt-2 max-h-60 max-w-full overflow-auto rounded-lg bg-white p-2 text-xs whitespace-pre-wrap break-words">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
