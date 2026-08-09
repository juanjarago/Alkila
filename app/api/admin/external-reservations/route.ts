import { NextResponse } from "next/server";
import { adminStatus, assertAdmin } from "@/lib/admin/auth";
import { listExternalChannelReservations } from "@/lib/booking/availability";

export const runtime = "nodejs";

function toYMD(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET(req: Request) {
  try {
    assertAdmin(req);

    const today = new Date();
    const from = toYMD(today);
    const to = toYMD(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()));
    const reservations = await listExternalChannelReservations({ from, to });

    return NextResponse.json(
      { from, to, reservations },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible cargar reservas externas." },
      { status: adminStatus(error) }
    );
  }
}
