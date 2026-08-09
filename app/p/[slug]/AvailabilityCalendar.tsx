"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarDay = {
  date: string;
  available: boolean;
  past: boolean;
  conflicts: Array<{
    source: "airbnb" | "booking" | "direct" | "manual";
    summary?: string;
  }>;
};

type CalendarResponse = {
  month: string;
  days: CalendarDay[];
  error?: string;
};

const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthTitle(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) return month;

  return new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));
}

function moveMonth(month: string, amount: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dayNumber(date: string) {
  return String(Number(date.slice(8, 10)));
}

function firstWeekdayOffset(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const day = new Date(year, monthNumber - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function sourceText(day: CalendarDay) {
  const source = day.conflicts[0]?.source;
  if (day.past) return "Fecha pasada";
  if (!source) return "Disponible";
  if (source === "airbnb") return "Ocupado por Airbnb";
  if (source === "booking") return "Ocupado por Booking";
  if (source === "direct") return "Reserva directa";
  return "Bloqueado";
}

export default function AvailabilityCalendar({ slug }: { slug: string }) {
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

    fetch(`/api/booking/availability?slug=${encodeURIComponent(slug)}&month=${month}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error ?? "No fue posible cargar el calendario.");
        return payload as CalendarResponse;
      })
      .then((payload) => {
        if (!alive) return;
        setData(payload);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message ?? "No fue posible cargar el calendario.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slug, month]);

  const cells = useMemo(() => {
    const offset = firstWeekdayOffset(month);
    return [...Array(offset).fill(null), ...(data?.days ?? [])] as Array<CalendarDay | null>;
  }, [data?.days, month]);

  return (
    <section className="property-calendar mt-4 rounded-[1.5rem] border border-[#C6C0B1] bg-[#F4EFE2] p-5 shadow-sm min-[900px]:rounded-[2rem] min-[900px]:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-black uppercase tracking-[0.18em] text-[#66752F]">
            Calendario
          </p>
          <h2 className="mt-1 text-[1.85rem] font-black capitalize leading-tight text-[#17332A]">
            {monthTitle(month)}
          </h2>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setMonth((value) => moveMonth(value, -1))}
            className="grid h-14 w-14 place-items-center rounded-full border border-[#C6C0B1] bg-white text-2xl font-black text-[#17332A] transition hover:-translate-y-0.5"
            aria-label="Mes anterior"
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={() => setMonth((value) => moveMonth(value, 1))}
            className="grid h-14 w-14 place-items-center rounded-full border border-[#C6C0B1] bg-white text-2xl font-black text-[#17332A] transition hover:-translate-y-0.5"
            aria-label="Mes siguiente"
          >
            {">"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-sm font-black uppercase text-[#66752F]">
        {dayLabels.map((label, index) => (
          <div key={`${label}-${index}`}>{label}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {cells.map((day, index) =>
          day ? (
            <div
              key={day.date}
              title={sourceText(day)}
              className={[
                "property-calendar-day grid aspect-square min-h-12 place-items-center rounded-xl text-lg font-black",
                day.available
                  ? "border border-[#D8D5C9] bg-white text-[#17332A]"
                  : day.past
                    ? "border border-[#D8D5C9] bg-[#E4DFD2] text-[#8A857A]"
                    : "border border-[#E3B6A9] bg-[#FBE9E4] text-[#B85F3B]",
              ].join(" ")}
            >
              {dayNumber(day.date)}
            </div>
          ) : (
            <div key={`empty-${index}`} className="aspect-square min-h-12" />
          )
        )}
      </div>

      {loading ? (
        <div className="mt-3 rounded-2xl border border-[#C6C0B1] bg-white p-4 text-base font-semibold text-[#4B544D]">
          Cargando disponibilidad...
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-base font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3 text-base font-bold text-[#4B544D]">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-[#D8D5C9] bg-white" />
          Libre
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-[#E3B6A9] bg-[#FBE9E4]" />
          Ocupado
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-[#D8D5C9] bg-[#E4DFD2]" />
          Pasado
        </span>
      </div>
    </section>
  );
}
