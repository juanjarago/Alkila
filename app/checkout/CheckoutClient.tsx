"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function CheckoutPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [payMode, setPayMode] = useState<"deposit" | "full">("deposit");
  const [error, setError] = useState("");

  const slug = sp.get("slug") ?? "";
  const checkIn = sp.get("checkIn") ?? "";
  const checkOut = sp.get("checkOut") ?? "";
  const guests = Number(sp.get("guests") ?? 0);
  const extras = (sp.get("extras") ?? "").split("|").filter(Boolean);
  const title = sp.get("title") ?? slug;
  const totalCOP = Number(sp.get("totalCOP") ?? 0);

 const ready = useMemo(
  () => slug && checkIn && checkOut && guests > 0 && totalCOP > 0,
  [slug, checkIn, checkOut, guests, totalCOP]
);


  async function onPay() {
    setError("");
    if (!ready) {
      setError("Faltan datos de la reserva. Vuelve a la propiedad y cotiza primero.");
      return;
    }

    setLoading(true);
    try {
     const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, checkIn, checkOut, guests, extras, totalCOP, payMode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No fue posible iniciar el pago");

      window.location.href = data.url; // redirige a Mercado Pago
    } catch (e: any) {
      setError(e?.message ?? "Error inesperado");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF7ED]">
      <div className="mx-auto max-w-xl px-4 pt-10">
        <h1 className="text-3xl font-extrabold text-gray-900">Pago de reserva</h1>

        <div className="mt-6 rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-600">Propiedad</div>
          <div className="text-lg font-extrabold text-gray-900">{slug}</div>

          <div className="mt-4 text-sm text-gray-700">
            <div>📅 {checkIn} a {checkOut}</div>
            <div>👥 {guests} personas</div>
            {extras.length > 0 && <div>➕ Extras: {extras.join(", ")}</div>}
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-gray-800 mb-2">Forma de pago</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPayMode("deposit")}
                className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-extrabold ${
                  payMode === "deposit" ? "border-[#C97A5D] bg-[#FAFAF8]" : "border-gray-200 bg-white"
                }`}
              >
                Anticipo (30%)
              </button>
              <button
                type="button"
                onClick={() => setPayMode("full")}
                className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-extrabold ${
                  payMode === "full" ? "border-[#C97A5D] bg-[#FAFAF8]" : "border-gray-200 bg-white"
                }`}
              >
                Pago total
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={onPay}
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-[#E76F51] px-4 py-3 text-sm font-extrabold text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Redirigiendo a pago..." : "Pagar ahora"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50"
          >
            Volver
          </button>
        </div>
      </div>
    </main>
  );
}
