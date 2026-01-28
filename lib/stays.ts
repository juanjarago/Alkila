type CalculatePriceInput = {
  from: string;
  to: string;
  listingIds: string[];
  guests: number;
  promocode?: string;
};

export async function staysCalculatePrice(input: CalculatePriceInput) {
  const baseUrl = process.env.STAYS_BASE_URL;
  const user = process.env.STAYS_API_USER;
  const password = process.env.STAYS_API_PASSWORD;

  if (!baseUrl || !user || !password) {
    throw new Error("Faltan credenciales de Stays en .env.local");
  }

  const auth = Buffer.from(`${user}:${password}`).toString("base64");

  const url = `${baseUrl.replace(/\/$/, "")}/reserva/calcular-precio`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Stays error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}
