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
    <div className="glass-panel w-full max-w-md rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2A9DB0]">
            Reserva segura
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-[#1F3D2B]">
            Consulta tu estadía
          </h2>
        </div>
        <span className="rounded-full bg-[#DDF3D1] px-3 py-1 text-xs font-black text-[#1F3D2B]">
          Online
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="min-w-0 text-sm font-bold text-[#1F3D2B]">
          Check-in
          <input
            className="mt-1 min-h-12 w-full min-w-0 rounded-2xl border border-[#E9D8A6] bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#F7B955]"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </label>

        <label className="min-w-0 text-sm font-bold text-[#1F3D2B]">
          Check-out
          <input
            className="mt-1 min-h-12 w-full min-w-0 rounded-2xl border border-[#E9D8A6] bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#F7B955]"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>

        <label className="min-w-0 text-sm font-bold text-[#1F3D2B] sm:col-span-2">
          Personas
          <input
            className="mt-1 min-h-12 w-full rounded-2xl border border-[#E9D8A6] bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#F7B955]"
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
        className="mt-5 w-full rounded-2xl bg-[#E76F51] px-4 py-3 font-black text-white shadow-lg shadow-[#E76F51]/20 transition hover:-translate-y-0.5"
      >
        Ver disponibilidad
      </button>

      <div className="mt-3 text-xs font-semibold leading-5 text-gray-700">
        Piscina y jacuzzi privados. Mascotas con tarifa adicional.
      </div>
    </div>
  );
}
