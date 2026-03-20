import { NextResponse } from "next/server";

// Mapa JFxx -> ObjectId real de STAYS
const STAYS_LISTING_ID_MAP: Record<string, string> = {
  JF08: "6671fcf283f5440237f5058f", // Cabaña 8
  JF06: "6671ff4283f5440237f54aa5", // Casa 16
  JF02: "669c05fb930a3f38680ebda",  // Finca 22
};

function resolveStaysListingId(input: string): string {
  const v = (input ?? "").trim();

  // Si ya viene un ObjectId válido, lo usamos tal cual
  if (/^[a-f0-9]{24}$/i.test(v)) return v;

  // Si viene JFxx, lo traducimos
  const mapped = STAYS_LISTING_ID_MAP[v];
  if (!mapped) throw new Error(`listingId desconocido: "${input}"`);
  return mapped;
}

function formatYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Intenta detectar "no disponible" desde el calendario.
 * Como no tenemos el schema exacto, lo hacemos tolerante.
 */
function isRangeAvailableFromCalendar(calendarData: any): boolean {
  const candidates =
    calendarData?.days ||
    calendarData?.dias ||
    calendarData?.calendar ||
    calendarData?.calendario ||
    calendarData?.data ||
    calendarData;

  const arr = Array.isArray(candidates) ? candidates : null;

  // Caso común: array de días
  if (arr && arr.length > 0) {
    for (const day of arr) {
      const available =
        day?.available ??
        day?.isAvailable ??
        day?.disponible ??
        null;

      const status = String(
        day?.status ??
          day?.estado ??
          day?.state ??
          day?.availabilityStatus ??
          ""
      ).toLowerCase();

      if (available === false) return false;

      if (
        status.includes("unavailable") ||
        status.includes("not_available") ||
        status.includes("booked") ||
        status.includes("reserved") ||
        status.includes("closed") ||
        status.includes("blocked") ||
        status.includes("ocupado") ||
        status.includes("reserv") ||
        status.includes("bloque")
      ) {
        return false;
      }
    }
    return true;
  }

  // Caso: boolean directo
  if (typeof calendarData?.available === "boolean") return calendarData.available;
  if (typeof calendarData?.disponible === "boolean") return calendarData.disponible;

  // Si no podemos interpretar, fallamos seguro:
  return false;
}

async function fetchCalendarOrThrow(opts: {
  baseUrl: string;
  authHeader: string;
  listingId: string;
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}) {
  const { baseUrl, authHeader, listingId, from, to } = opts;

  // Swagger que me mandaste: /calendar/listing/{listingId} con params de/a (de=a=)
  // Tu screenshot: /calendario/listado/{listingId}
  const candidates = [
    `${baseUrl}/external/v1/calendar/listing/${listingId}?de=${encodeURIComponent(from)}&a=${encodeURIComponent(to)}`,
    `${baseUrl}/external/v1/calendario/listado/${listingId}?de=${encodeURIComponent(from)}&a=${encodeURIComponent(to)}`,
  ];

  let lastErr: any = null;

  for (const url of candidates) {
    try {
      const r = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: authHeader,
        },
        cache: "no-store",
      });

      const raw = await r.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = { message: raw };
      }

      if (!r.ok) {
        lastErr = new Error(
          data?.error || data?.message || `Calendar error (${r.status})`
        );
        continue;
      }

      return data;
    } catch (e: any) {
      lastErr = e;
      continue;
    }
  }

  throw lastErr ?? new Error("No fue posible consultar el calendario en STAYS");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ----------------------------
    // 1) Validación de fechas
    // ----------------------------
    const { from, to } = body as { from?: string; to?: string };

    if (!from || !to) {
      return NextResponse.json(
        { error: "Fechas inválidas: from/to requeridas" },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: "Fechas inválidas: formato no reconocido (use YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // normaliza a medianoche
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ❌ No permitir fechas pasadas
    if (fromDate < today) {
      return NextResponse.json(
        { error: "No permitimos reservas en fechas pasadas. Selecciona una fecha futura." },
        { status: 400 }
      );
    }

    // ❌ Check-out debe ser posterior
    if (toDate <= fromDate) {
      return NextResponse.json(
        { error: "La fecha de salida debe ser posterior a la de entrada." },
        { status: 400 }
      );
    }

    // ----------------------------
    // 2) Validación mínima del body
    // ----------------------------
    const listingIdsRaw = body?.listingIds;
    if (!Array.isArray(listingIdsRaw) || listingIdsRaw.length === 0) {
      return NextResponse.json(
        { error: "Body inválido: listingIds debe ser un array no vacío" },
        { status: 400 }
      );
    }

    if (typeof body?.guests !== "number" || body.guests < 1) {
      return NextResponse.json(
        { error: "Body inválido: guests debe ser un número >= 1" },
        { status: 400 }
      );
    }

    // ----------------------------
    // 3) Variables de entorno STAYS
    // ----------------------------
    const baseUrlRaw = process.env.STAYS_BASE_URL;
    const user = process.env.STAYS_API_USER;
    const password = process.env.STAYS_API_PASSWORD;

    if (!baseUrlRaw || !user || !password) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de STAYS" },
        { status: 500 }
      );
    }

    const baseUrl = baseUrlRaw.replace(/\/+$/, "");
    const auth = Buffer.from(`${user}:${password}`).toString("base64");
    const authHeader = `Basic ${auth}`;

    // ----------------------------
    // 4) Resolver listingIds (JFxx -> ObjectId)
    // ----------------------------
    const resolvedListingIds = listingIdsRaw.map((id: any) =>
      resolveStaysListingId(String(id))
    );

    // =========================================================
    // ✅ PUNTO 2: Validar disponibilidad REAL en calendario STAYS
    // =========================================================
    const fromYMD = formatYMD(fromDate);
    const toYMD = formatYMD(toDate);

    for (const listingId of resolvedListingIds) {
      const calendarData = await fetchCalendarOrThrow({
        baseUrl,
        authHeader,
        listingId,
        from: fromYMD,
        to: toYMD,
      });

      const ok = isRangeAvailableFromCalendar(calendarData);

      if (!ok) {
        return NextResponse.json(
          {
            error:
              "La propiedad no está disponible para esas fechas (validación calendario STAYS).",
            calendar: calendarData,
          },
          { status: 409 }
        );
      }
    }

    // =========================================================
    // ✅ Si está disponible, ahora sí calculamos precio
    // =========================================================
    const priceUrl = `${baseUrl}/external/v1/booking/calculate-price`;

    const bodyToStays = {
      ...body,
      listingIds: resolvedListingIds,
    };

    const res = await fetch(priceUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(bodyToStays),
      cache: "no-store",
    });

    const raw = await res.text();

    let data: any;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = { message: raw };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Error consultando STAYS" },
      { status: 500 }
    );
  }
}
