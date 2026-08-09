import { NextResponse } from "next/server";
import { collectAvailabilityConflicts } from "@/lib/booking/availability";
import { properties } from "@/lib/properties";

export const runtime = "nodejs";

type CalendarDay = {
  date: string;
  available: boolean;
  past: boolean;
  conflicts: Array<{
    source: "airbnb" | "booking" | "direct" | "manual";
    summary?: string;
  }>;
};

function toYMD(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addMonths(year: number, monthIndex: number, amount: number) {
  return new Date(year, monthIndex + amount, 1);
}

function parseMonth(value: string | null) {
  const clean = String(value ?? "").slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(clean)) return null;

  const [year, month] = clean.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) return null;

  return { year, monthIndex: month - 1, month: clean };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = String(url.searchParams.get("slug") ?? "").trim();
    const requestedMonth = parseMonth(url.searchParams.get("month"));

    if (!properties.some((property) => property.slug === slug)) {
      return NextResponse.json({ error: "Propiedad no encontrada." }, { status: 404 });
    }

    const now = new Date();
    const selected =
      requestedMonth ?? {
        year: now.getFullYear(),
        monthIndex: now.getMonth(),
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      };

    const startDate = new Date(selected.year, selected.monthIndex, 1);
    const endDate = addMonths(selected.year, selected.monthIndex, 1);
    const from = toYMD(startDate);
    const to = toYMD(endDate);
    const today = toYMD(now);
    const conflicts = await collectAvailabilityConflicts({
      propertySlug: slug,
      from,
      to,
    });

    const days: CalendarDay[] = [];
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      const date = toYMD(d);
      const dayConflicts = conflicts
        .filter((conflict) => date >= conflict.start && date < conflict.end)
        .map((conflict) => ({
          source: conflict.source,
          summary: conflict.summary,
        }));

      days.push({
        date,
        available: dayConflicts.length === 0 && date >= today,
        past: date < today,
        conflicts: dayConflicts,
      });
    }

    return NextResponse.json(
      {
        month: selected.month,
        from,
        to,
        days,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible cargar el calendario." },
      { status: 502 }
    );
  }
}
