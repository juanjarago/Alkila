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
    <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#66752F]">
            Consulta de fechas
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-[#17332A]">
            Consulta tu estadía
          </h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#17332A]">
          Online
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        <label className="min-w-0 text-sm font-black text-[#17332A]">
          Check-in
          <input
            className="mt-1 min-h-12 w-full min-w-0 rounded-2xl border border-[#C6C0B1] bg-white px-4 py-2 text-base outline-none focus:ring-2 focus:ring-[#B8794A]"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </label>

        <label className="min-w-0 text-sm font-black text-[#17332A]">
          Check-out
          <input
            className="mt-1 min-h-12 w-full min-w-0 rounded-2xl border border-[#C6C0B1] bg-white px-4 py-2 text-base outline-none focus:ring-2 focus:ring-[#B8794A]"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>

        <label className="min-w-0 text-sm font-black text-[#17332A]">
          Personas
          <input
            className="mt-1 min-h-12 w-full rounded-2xl border border-[#C6C0B1] bg-white px-4 py-2 text-base outline-none focus:ring-2 focus:ring-[#B8794A]"
            type="number"
            min={1}
            max={22}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
          />
        </label>
      </div>

      <button
        onClick={go}
        className="mt-5 w-full rounded-2xl bg-[#B85F3B] px-4 py-3 font-black text-white shadow-sm transition hover:-translate-y-0.5"
      >
        Ver disponibilidad
      </button>

      <div className="mt-3 text-xs font-semibold leading-5 text-[#4B544D]">
        Piscina y jacuzzi privados. Mascotas con tarifa adicional.
      </div>
    </div>
  );
}
