"use client";

import { useEffect, useMemo, useState } from "react";
import { properties } from "@/lib/properties";
import {
  colombiaSeasonMatches,
  colombiaSeasonWindows,
  type ColombiaSeasonKind,
} from "@/lib/booking/colombiaCalendar";
import { DEFAULT_PRICING_RULES } from "@/lib/booking/pricing";
import type { ManualBlock, PricingRule, SeasonalRate } from "@/lib/booking/types";

type ReservationRow = {
  id: string;
  propertyTitle: string;
  from: string;
  to: string;
  guests: number;
  totalCOP: number;
  paidCOP: number;
  payMode: "deposit" | "full";
  status: string;
};

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function numberValue(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const automaticSeasonFields: Array<{
  kind: ColombiaSeasonKind;
  title: string;
  dates: string;
  percentKey: keyof PricingRule;
  minKey: keyof PricingRule;
  suggestedPercent: number;
  suggestedMin: number;
}> = [
  {
    kind: "holiday_weekend",
    title: "Festivo / puente",
    dates: "Viernes a lunes cuando hay festivo",
    percentKey: "holidayWeekendIncreasePercent",
    minKey: "holidayWeekendMinNights",
    suggestedPercent: 20,
    suggestedMin: 3,
  },
  {
    kind: "holy_week",
    title: "Semana Santa",
    dates: "Domingo de Ramos a Domingo de Pascua",
    percentKey: "holyWeekIncreasePercent",
    minKey: "holyWeekMinNights",
    suggestedPercent: 40,
    suggestedMin: 4,
  },
  {
    kind: "school_break",
    title: "Semana de receso",
    dates: "Semana anterior al festivo del 12 de octubre",
    percentKey: "schoolBreakIncreasePercent",
    minKey: "schoolBreakMinNights",
    suggestedPercent: 25,
    suggestedMin: 4,
  },
  {
    kind: "christmas",
    title: "Navidad",
    dates: "20 al 27 de diciembre",
    percentKey: "christmasIncreasePercent",
    minKey: "christmasMinNights",
    suggestedPercent: 35,
    suggestedMin: 4,
  },
  {
    kind: "new_year",
    title: "Ano Nuevo",
    dates: "28 de diciembre al 5 de enero",
    percentKey: "newYearIncreasePercent",
    minKey: "newYearMinNights",
    suggestedPercent: 45,
    suggestedMin: 4,
  },
];

function ymdFromParts(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function seasonValue(rule: PricingRule, kind: ColombiaSeasonKind, field: "percent" | "min") {
  const config = automaticSeasonFields.find((item) => item.kind === kind);
  if (!config) return 0;
  return Number(rule[field === "percent" ? config.percentKey : config.minKey] ?? 0);
}

function seasonDay(rule: PricingRule, ymd: string) {
  const matches = colombiaSeasonMatches(ymd);
  const percent = Math.max(0, ...matches.map((match) => seasonValue(rule, match.kind, "percent")));
  const minNights = Math.max(0, ...matches.map((match) => seasonValue(rule, match.kind, "min")));
  const label = matches.map((match) => match.label).join(" + ");
  return { matches, percent, minNights, label };
}

export default function AdminClient() {
  const [token, setToken] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [rules, setRules] = useState<PricingRule[]>(DEFAULT_PRICING_RULES);
  const [blocks, setBlocks] = useState<ManualBlock[]>([]);
  const [seasonalRates, setSeasonalRates] = useState<SeasonalRate[]>([]);
  const [previewPropertySlug, setPreviewPropertySlug] = useState(
    properties[0]?.slug ?? ""
  );
  const [blockDraft, setBlockDraft] = useState({
    propertySlug: properties[0]?.slug ?? "",
    from: "",
    to: "",
    reason: "Bloqueo manual",
  });
  const [seasonDraft, setSeasonDraft] = useState({
    propertySlug: properties[0]?.slug ?? "",
    name: "Temporada especial",
    from: "",
    to: "",
    nightCOP: 0,
    minNights: 2,
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  useEffect(() => {
    const storedToken = window.sessionStorage.getItem("alkila_admin_token");
    if (storedToken) setToken(storedToken);
  }, []);

  function authHeaders() {
    return token ? { "x-admin-token": token } : {};
  }

  async function validateAdmin() {
    setError("");
    setMessage("");
    setIsAuthorized(false);

    if (!token.trim()) {
      setError("Ingresa el token de admin.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No autorizado.");

      window.sessionStorage.setItem("alkila_admin_token", token);
      setIsAuthorized(true);
      const loaded = await loadAdminData(true);
      if (!loaded) return;
      setMessage("Acceso admin validado.");
    } catch (e: any) {
      window.sessionStorage.removeItem("alkila_admin_token");
      setError(e?.message ?? "No fue posible validar el acceso.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminData(skipLoading = false) {
    setError("");
    setMessage("");
    if (!skipLoading) setLoading(true);
    try {
      const [reservationsRes, pricingRes, blocksRes, seasonalRatesRes] =
        await Promise.all([
        fetch("/api/booking/reservations", { headers: authHeaders() }),
        fetch("/api/admin/pricing", { headers: authHeaders() }),
        fetch("/api/admin/blocks", { headers: authHeaders() }),
        fetch("/api/admin/seasonal-rates", { headers: authHeaders() }),
      ]);

      const reservationsData = await reservationsRes.json();
      const pricingData = await pricingRes.json();
      const blocksData = await blocksRes.json();
      const seasonsData = await seasonalRatesRes.json();

      if (!reservationsRes.ok) throw new Error(reservationsData?.error);
      if (!pricingRes.ok) throw new Error(pricingData?.error);
      if (!blocksRes.ok) throw new Error(blocksData?.error);
      if (!seasonalRatesRes.ok) throw new Error(seasonsData?.error);

      setReservations(reservationsData.reservations ?? []);
      setRules(pricingData.rules ?? DEFAULT_PRICING_RULES);
      setBlocks(blocksData.blocks ?? []);
      setSeasonalRates(seasonsData.rates ?? []);
      setMessage("Datos cargados.");
      return true;
    } catch (e: any) {
      setIsAuthorized(false);
      setError(e?.message ?? "Error inesperado");
      return false;
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }

  async function saveRule(rule: PricingRule) {
    setError("");
    setMessage("");
    try {
      if (!isAuthorized) throw new Error("Valida el acceso admin antes de guardar.");
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(rule),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No fue posible guardar precio");
      setRules((current) =>
        current.map((item) =>
          item.propertySlug === data.rule.propertySlug ? data.rule : item
        )
      );
      setMessage("Precio guardado.");
    } catch (e: any) {
      setError(e?.message ?? "Error inesperado");
    }
  }

  async function createBlock() {
    setError("");
    setMessage("");
    try {
      if (!isAuthorized) throw new Error("Valida el acceso admin antes de guardar.");
      const res = await fetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(blockDraft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No fue posible crear bloqueo");
      setBlocks((current) => [...current, data.block]);
      setMessage("Bloqueo creado.");
    } catch (e: any) {
      setError(e?.message ?? "Error inesperado");
    }
  }

  async function createSeasonalRate() {
    setError("");
    setMessage("");
    try {
      if (!isAuthorized) throw new Error("Valida el acceso admin antes de guardar.");
      const res = await fetch("/api/admin/seasonal-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(seasonDraft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No fue posible crear temporada");
      setSeasonalRates((current) => [...current, data.rate]);
      setMessage("Temporada especial creada.");
    } catch (e: any) {
      setError(e?.message ?? "Error inesperado");
    }
  }

  async function markReservationPaid(reservation: ReservationRow) {
    setError("");
    setMessage("");

    const paidCOP =
      reservation.payMode === "deposit"
        ? Math.round(reservation.totalCOP * 0.3)
        : reservation.totalCOP;

    const ok = window.confirm(
      `Marcar esta reserva como pagada por ${formatCOP(paidCOP)}? Al hacerlo bloqueara calendarios y saldra en el iCal de Alkila.`
    );
    if (!ok) return;

    try {
      if (!isAuthorized) throw new Error("Valida el acceso admin antes de guardar.");
      const res = await fetch("/api/booking/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ id: reservation.id, action: "mark_paid" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No fue posible marcar la reserva");
      setReservations((current) =>
        current.map((item) => (item.id === data.reservation.id ? data.reservation : item))
      );
      setMessage("Reserva marcada como pagada. Ya bloquea disponibilidad e iCal.");
    } catch (e: any) {
      setError(e?.message ?? "Error inesperado");
    }
  }

  function updateRule(propertySlug: string, updates: Partial<PricingRule>) {
    setRules((current) =>
      current.map((rule) =>
        rule.propertySlug === propertySlug ? { ...rule, ...updates } : rule
      )
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF7ED]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold text-[#E76F51]">Alkila admin</div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Reservas, precios y calendarios
            </h1>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="password"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setIsAuthorized(false);
              }}
              placeholder="ADMIN_TOKEN"
              className="w-44 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={validateAdmin}
              className="rounded-xl bg-[#1F3D2B] px-4 py-2 text-sm font-bold text-white"
            >
              {loading ? "Validando..." : isAuthorized ? "Admin validado" : "Validar admin"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {message}
          </div>
        )}

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {properties.map((property) => {
            const rule =
              rules.find((item) => item.propertySlug === property.slug) ??
              DEFAULT_PRICING_RULES.find((item) => item.propertySlug === property.slug)!;
            const calendarUrl = `${origin}/api/calendar/${property.slug}`;

            return (
              <article
                key={property.slug}
                className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm"
              >
                <div className="text-xs font-bold uppercase text-gray-500">
                  {property.shortTitle}
                </div>
                <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                  {property.title}
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <label className="font-semibold text-gray-700">
                    Noche base
                    <input
                      type="number"
                      disabled={!isAuthorized}
                      value={rule.baseNightCOP}
                      onChange={(e) =>
                        updateRule(property.slug, {
                          baseNightCOP: numberValue(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 disabled:opacity-60"
                    />
                  </label>
                  <label className="font-semibold text-gray-700">
                    Fin de semana
                    <input
                      type="number"
                      disabled={!isAuthorized}
                      value={rule.weekendNightCOP ?? 0}
                      onChange={(e) =>
                        updateRule(property.slug, {
                          weekendNightCOP: numberValue(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 disabled:opacity-60"
                    />
                  </label>
                  <label className="font-semibold text-gray-700">
                    Limpieza
                    <input
                      type="number"
                      disabled={!isAuthorized}
                      value={rule.cleaningFeeCOP}
                      onChange={(e) =>
                        updateRule(property.slug, {
                          cleaningFeeCOP: numberValue(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 disabled:opacity-60"
                    />
                  </label>
                  <label className="font-semibold text-gray-700">
                    Min noches entre semana
                    <input
                      type="number"
                      disabled={!isAuthorized}
                      value={rule.minWeekdayNights}
                      onChange={(e) =>
                        updateRule(property.slug, {
                          minNights: numberValue(e.target.value),
                          minWeekdayNights: numberValue(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 disabled:opacity-60"
                    />
                  </label>
                  <label className="font-semibold text-gray-700">
                    Min noches fin de semana
                    <input
                      type="number"
                      disabled={!isAuthorized}
                      value={rule.minWeekendNights}
                      onChange={(e) =>
                        updateRule(property.slug, {
                          minWeekendNights: numberValue(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 disabled:opacity-60"
                    />
                  </label>
                  <label className="font-semibold text-gray-700">
                    Huespedes incluidos
                    <input
                      type="number"
                      disabled={!isAuthorized}
                      value={rule.includedGuests}
                      onChange={(e) =>
                        updateRule(property.slug, {
                          includedGuests: numberValue(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 disabled:opacity-60"
                    />
                  </label>
                  <label className="font-semibold text-gray-700">
                    Adicional por noche
                    <input
                      type="number"
                      disabled={!isAuthorized}
                      value={rule.extraGuestFeeCOP ?? 0}
                      onChange={(e) =>
                        updateRule(property.slug, {
                          extraGuestFeeCOP: numberValue(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 disabled:opacity-60"
                    />
                  </label>
                  <label className="font-semibold text-gray-700">
                    Mascotas por estadia
                    <input
                      type="number"
                      disabled={!isAuthorized}
                      value={rule.petFeeCOP}
                      onChange={(e) =>
                        updateRule(property.slug, {
                          petFeeCOP: numberValue(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 disabled:opacity-60"
                    />
                  </label>
                  <label className="font-semibold text-gray-700">
                    Servicio domestico dia
                    <input
                      type="number"
                      disabled={!isAuthorized}
                      value={rule.domesticServiceFeePerDayCOP}
                      onChange={(e) =>
                        updateRule(property.slug, {
                          domesticServiceFeePerDayCOP: numberValue(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 disabled:opacity-60"
                    />
                  </label>
                  <label className="font-semibold text-gray-700">
                    Early check-in %
                    <input
                      type="number"
                      disabled={!isAuthorized}
                      value={rule.earlyCheckInPercent}
                      onChange={(e) =>
                        updateRule(property.slug, {
                          earlyCheckInPercent: numberValue(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 disabled:opacity-60"
                    />
                  </label>
                  <label className="font-semibold text-gray-700">
                    Late check-out %
                    <input
                      type="number"
                      disabled={!isAuthorized}
                      value={rule.lateCheckoutPercent}
                      onChange={(e) =>
                        updateRule(property.slug, {
                          lateCheckoutPercent: numberValue(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 disabled:opacity-60"
                    />
                  </label>
                  <div className="col-span-2 mt-2 border-t border-orange-100 pt-4">
                    <div className="text-sm font-extrabold text-gray-900">
                      Incrementos automaticos por calendario Colombia
                    </div>
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      El sistema reconoce festivos, Semana Santa, semana de receso,
                      Navidad y Ano Nuevo. Puedes definir incremento y minimo de noches.
                      Si hay temporada especial manual con precio fijo, se respeta ese precio.
                    </p>
                  </div>
                  {automaticSeasonFields.map((season) => (
                    <div
                      key={season.kind}
                      className="col-span-2 rounded-xl border border-orange-100 bg-orange-50 p-3"
                    >
                      <div className="font-extrabold text-gray-900">{season.title}</div>
                      <div className="mt-1 text-xs font-normal text-gray-600">
                        {season.dates}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <label className="font-semibold text-gray-700">
                          Incremento %
                          <input
                            type="number"
                            disabled={!isAuthorized}
                            value={Number(rule[season.percentKey] ?? 0)}
                            onChange={(e) =>
                              updateRule(property.slug, {
                                [season.percentKey]: numberValue(e.target.value),
                              } as Partial<PricingRule>)
                            }
                            className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 disabled:opacity-60"
                          />
                          <span className="mt-1 block text-xs font-normal text-gray-500">
                            Sugerido {season.suggestedPercent}%
                          </span>
                        </label>
                        <label className="font-semibold text-gray-700">
                          Minimo noches
                          <input
                            type="number"
                            disabled={!isAuthorized}
                            value={Number(rule[season.minKey] ?? 1)}
                            onChange={(e) =>
                              updateRule(property.slug, {
                                [season.minKey]: numberValue(e.target.value),
                              } as Partial<PricingRule>)
                            }
                            className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 disabled:opacity-60"
                          />
                          <span className="mt-1 block text-xs font-normal text-gray-500">
                            Sugerido {season.suggestedMin} noches
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => saveRule(rule)}
                  disabled={!isAuthorized}
                  className="mt-4 w-full rounded-xl bg-[#E76F51] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Guardar precio
                </button>

                <div className="mt-4 rounded-xl bg-orange-50 p-3 text-xs text-gray-700">
                  <div className="font-bold">iCal Alkila para Airbnb/Booking</div>
                  <div className="mt-1 break-all">{calendarUrl}</div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-8 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Calendario Colombia y temporadas automaticas
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Vista de 4 meses con festivos, temporadas altas, incremento aplicado y
                minimo de noches segun la propiedad.
              </p>
            </div>
            <label className="text-sm font-semibold text-gray-700">
              Propiedad
              <select
                value={previewPropertySlug}
                onChange={(e) => setPreviewPropertySlug(e.target.value)}
                className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm md:w-60"
              >
                {properties.map((property) => (
                  <option key={property.slug} value={property.slug}>
                    {property.shortTitle}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {(() => {
            const previewRule =
              rules.find((item) => item.propertySlug === previewPropertySlug) ??
              DEFAULT_PRICING_RULES.find(
                (item) => item.propertySlug === previewPropertySlug
              ) ??
              DEFAULT_PRICING_RULES[0];
            const today = new Date();
            const years = [today.getFullYear(), today.getFullYear() + 1];
            const windows = years.flatMap(colombiaSeasonWindows);

            return (
              <>
                <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  {windows.slice(0, 8).map((window) => (
                    <div
                      key={`${window.kind}-${window.from}`}
                      className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-gray-700"
                    >
                      <div className="font-extrabold text-gray-900">{window.label}</div>
                      <div>
                        {window.from} a {window.to}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-4">
                  {Array.from({ length: 4 }, (_, index) => addMonths(today, index)).map(
                    (monthDate) => {
                      const year = monthDate.getFullYear();
                      const month = monthDate.getMonth();
                      const firstDay = new Date(year, month, 1).getDay();
                      const blanks = (firstDay + 6) % 7;
                      const days = new Date(year, month + 1, 0).getDate();

                      return (
                        <div
                          key={`${year}-${month}`}
                          className="rounded-2xl border border-orange-100 bg-[#FFF7ED] p-3"
                        >
                          <div className="text-sm font-extrabold capitalize text-[#1F3D2B]">
                            {monthLabel(monthDate)}
                          </div>
                          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#6B7D2D]">
                            {["L", "M", "M", "J", "V", "S", "D"].map((day, dayIndex) => (
                              <div key={`${day}-${dayIndex}`}>{day}</div>
                            ))}
                          </div>
                          <div className="mt-1 grid grid-cols-7 gap-1">
                            {Array.from({ length: blanks }).map((_, blank) => (
                              <div key={`blank-${blank}`} className="min-h-12" />
                            ))}
                            {Array.from({ length: days }, (_, dayIndex) => {
                              const day = dayIndex + 1;
                              const ymd = ymdFromParts(year, month, day);
                              const status = seasonDay(previewRule, ymd);
                              const isHot = status.percent >= 40;
                              const isWarm = status.percent > 0;
                              const className = isHot
                                ? "border-[#8F3F2A] bg-[#8F3F2A] text-white"
                                : isWarm
                                ? "border-[#D08A5B] bg-[#F4D6B8] text-[#1F3D2B]"
                                : "border-orange-100 bg-white text-gray-700";

                              return (
                                <div
                                  key={ymd}
                                  title={status.label || "Tarifa normal"}
                                  className={`min-h-12 rounded-lg border p-1 text-left ${className}`}
                                >
                                  <div className="text-xs font-extrabold">{day}</div>
                                  {status.percent > 0 && (
                                    <div className="mt-1 leading-tight">
                                      <div className="text-[10px] font-black">
                                        +{status.percent}%
                                      </div>
                                      <div className="text-[9px] font-bold">
                                        min {status.minNights}n
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            );
          })()}
        </section>

        <section className="mt-8 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900">
            Temporadas especiales
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Usa esto para festivos, vacaciones, fin de ano y fechas de alta demanda.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-semibold text-gray-700">
              Propiedad
              <select
                disabled={!isAuthorized}
                value={seasonDraft.propertySlug}
                onChange={(e) =>
                  setSeasonDraft((current) => ({
                    ...current,
                    propertySlug: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
              >
                {properties.map((property) => (
                  <option key={property.slug} value={property.slug}>
                    {property.shortTitle}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Nombre de la temporada
              <input
                disabled={!isAuthorized}
                value={seasonDraft.name}
                onChange={(e) =>
                  setSeasonDraft((current) => ({ ...current, name: e.target.value }))
                }
                placeholder="Ej: Fin de ano"
                className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Fecha inicial
              <input
                type="date"
                disabled={!isAuthorized}
                value={seasonDraft.from}
                onChange={(e) =>
                  setSeasonDraft((current) => ({ ...current, from: e.target.value }))
                }
                className="mt-1 min-h-11 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Fecha final
              <input
                type="date"
                disabled={!isAuthorized}
                value={seasonDraft.to}
                onChange={(e) =>
                  setSeasonDraft((current) => ({ ...current, to: e.target.value }))
                }
                className="mt-1 min-h-11 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Precio por noche en esta temporada
              <input
                type="number"
                disabled={!isAuthorized}
                value={seasonDraft.nightCOP}
                onChange={(e) =>
                  setSeasonDraft((current) => ({
                    ...current,
                    nightCOP: numberValue(e.target.value),
                  }))
                }
                placeholder="Ej: 3200000"
                className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Minimo de noches en esta temporada
              <input
                type="number"
                disabled={!isAuthorized}
                value={seasonDraft.minNights}
                onChange={(e) =>
                  setSeasonDraft((current) => ({
                    ...current,
                    minNights: numberValue(e.target.value),
                  }))
                }
                placeholder="Ej: 3"
                className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
              />
            </label>
            <button
              type="button"
              onClick={createSeasonalRate}
              disabled={!isAuthorized}
              className="self-end rounded-xl bg-[#E76F51] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Crear
            </button>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-gray-700">
            {seasonalRates.map((rate) => (
              <div
                key={rate.id}
                className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2"
              >
                <span className="font-bold">{rate.name}</span> - {rate.propertySlug}:{" "}
                {rate.from} a {rate.to}, {formatCOP(rate.nightCOP)} por noche
                {rate.minNights ? `, minimo ${rate.minNights} noches` : ""}
              </div>
            ))}
            {seasonalRates.length === 0 && (
              <div className="text-gray-500">Sin temporadas especiales.</div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900">Bloqueos manuales</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-[1.5fr,1fr,1fr,1.2fr,auto]">
            <select
              disabled={!isAuthorized}
              value={blockDraft.propertySlug}
              onChange={(e) =>
                setBlockDraft((current) => ({
                  ...current,
                  propertySlug: e.target.value,
                }))
              }
              className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
            >
              {properties.map((property) => (
                <option key={property.slug} value={property.slug}>
                  {property.shortTitle}
                </option>
              ))}
            </select>
            <input
              type="date"
              disabled={!isAuthorized}
              value={blockDraft.from}
              onChange={(e) =>
                setBlockDraft((current) => ({ ...current, from: e.target.value }))
              }
              className="min-h-11 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
            />
            <input
              type="date"
              disabled={!isAuthorized}
              value={blockDraft.to}
              onChange={(e) =>
                setBlockDraft((current) => ({ ...current, to: e.target.value }))
              }
              className="min-h-11 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
            />
            <input
              disabled={!isAuthorized}
              value={blockDraft.reason}
              onChange={(e) =>
                setBlockDraft((current) => ({ ...current, reason: e.target.value }))
              }
              className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
            />
            <button
              type="button"
              onClick={createBlock}
              disabled={!isAuthorized}
              className="rounded-xl bg-[#1F3D2B] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Bloquear
            </button>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-gray-700">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2"
              >
                {block.propertySlug}: {block.from} a {block.to} - {block.reason}
              </div>
            ))}
            {blocks.length === 0 && <div className="text-gray-500">Sin bloqueos.</div>}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900">Reservas</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2">Propiedad</th>
                  <th>Fechas</th>
                  <th>Personas</th>
                  <th>Total</th>
                  <th>Pagado</th>
                  <th>Estado</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b last:border-0">
                    <td className="py-3 font-semibold">{reservation.propertyTitle}</td>
                    <td>
                      {reservation.from} a {reservation.to}
                    </td>
                    <td>{reservation.guests}</td>
                    <td>{formatCOP(reservation.totalCOP)}</td>
                    <td>{formatCOP(reservation.paidCOP)}</td>
                    <td>{reservation.status}</td>
                    <td>
                      {reservation.status === "pending_payment" ? (
                        <button
                          type="button"
                          onClick={() => markReservationPaid(reservation)}
                          disabled={!isAuthorized || loading}
                          className="rounded-xl bg-[#1F3D2B] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          Marcar pagada
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">Sin accion</span>
                      )}
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td className="py-6 text-gray-500" colSpan={7}>
                      No hay reservas cargadas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
