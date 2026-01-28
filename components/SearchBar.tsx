"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(8);

  function go() {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", String(guests));
    router.push(`/propiedades?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-orange-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm">
          <div className="mb-1 font-semibold">Check-in</div>
          <input className="w-full rounded-xl border p-2" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </label>

        <label className="text-sm">
          <div className="mb-1 font-semibold">Check-out</div>
          <input className="w-full rounded-xl border p-2" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </label>

        <label className="text-sm">
          <div className="mb-1 font-semibold">Personas</div>
          <input className="w-full rounded-xl border p-2" type="number" min={1} max={22} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
        </label>
      </div>

      <button onClick={go} className="mt-4 w-full rounded-xl bg-[#E76F51] px-4 py-3 font-semibold text-white hover:opacity-90">
        Ver disponibilidad
      </button>

      <div className="mt-2 text-xs text-gray-600">Piscina y jacuzzi privados · Pet friendly (tarifa adicional)</div>
    </div>
  );
}
