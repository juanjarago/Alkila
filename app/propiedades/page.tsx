import Link from "next/link";
import { properties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const guests = Number(params.guests ?? "0") || 0;

  const filtered =
    guests > 0 ? properties.filter((p) => p.capacity >= guests) : properties;

  const tabs = [
    { label: "Hasta 8", value: 8 },
    { label: "Hasta 16", value: 16 },
    { label: "Hasta 22", value: 22 },
  ];

  return (
    <main className="min-h-screen bg-[#FFF7ED]">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FFF7ED]" />
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Fincas privadas en Anapoima según el tamaño de tu grupo
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Piscina y jacuzzi privados · Pet friendly con tarifa adicional · Reserva segura
          </p>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((t) => {
              const active = guests === t.value;
              return (
                <Link
                  key={t.value}
                  href={`/propiedades?guests=${t.value}`}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-white text-gray-900"
                      : "bg-white/15 text-white hover:bg-white/25",
                  ].join(" ")}
                >
                  {t.label}
                </Link>
              );
            })}
            <Link
              href="/propiedades"
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                guests === 0
                  ? "bg-white text-gray-900"
                  : "bg-white/15 text-white hover:bg-white/25",
              ].join(" ")}
            >
              Ver todas
            </Link>
          </div>

          {/* Filtro actual */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm">
            <span>Filtro:</span>
            <span className="rounded-full bg-orange-100 px-3 py-1">
              {guests > 0 ? `Grupos de ${guests}+` : "Sin filtro de personas"}
            </span>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.slug} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
