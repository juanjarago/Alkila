import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Opción 1: devolver 410 para indicar que ya no se usa
  return NextResponse.json(
    { error: "Endpoint deprecated. Use /api/reserva/calcular-precio" },
    { status: 410 }
  );
}
