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
  if (/^[a-f0-9]{24}$/.test(v)) return v;

  // Si viene JFxx, lo traducimos
  const mapped = STAYS_LISTING_ID_MAP[v];
  if (!mapped) throw new Error(`listingId desconocido: "${input}"`);
  return mapped;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

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
    const url = `${baseUrl}/external/v1/booking/calculate-price`;

    // Validación mínima del body
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

    // ✅ SOLO traducimos listingIds, NO tocamos guests
    const resolvedListingIds = listingIdsRaw.map((id: any) =>
      resolveStaysListingId(String(id))
    );

    const bodyToStays = {
      ...body,
      listingIds: resolvedListingIds,
      // guests queda tal cual lo envía el cliente
    };

    const auth = Buffer.from(`${user}:${password}`).toString("base64");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
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
