import Link from "next/link";
import Image from "next/image";
import { properties } from "@/lib/properties";

export default function PropiedadesPage({
  searchParams,
}: {
  searchParams?: { guests?: string };
}) {
  const guests = Number(searchParams?.guests || 0);

  // filtro simple por capacidad si viene guests
  const filtered = guests > 0 ? properties.filter((p) => p.capacity >= guests) : properties;

  return (
    <main className="min-h-screen bg-[#FFF7ED]">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-base font-extrabold text-gray-900">
            Alkila<span className="text-[#E76F51]">.</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/propiedades" className="text-sm font-semibold text-gray-700 hover:underline">
              Propiedades
            </Link>
            <Link href="/anapoima" className="text-sm font-semibold text-gray-700 hover:underline">
              Anapoima
            </Link>

            <a
              href="https://wa.me/"
              className="rounded-full bg-[#E76F51] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Hero */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr,0.8fr] items-start">
          <div>
            {/* ✅ Título con buen contraste */}
           <h1 className="text-5xl font-extrabold !text-black">
  Fincas privadas en Anapoima según el tamaño de tu grupo
</h1>


            <p className="mt-4 text-base md:text-lg text-gray-700">
              Piscina y jacuzzi privados · Pet friendly con tarifa adicional · Reserva segura
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/propiedades?guests=8"
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-900 border border-orange-200 hover:bg-orange-50"
              >
                Hasta 8
              </Link>
              <Link
                href="/propiedades?guests=16"
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-900 border border-orange-200 hover:bg-orange-50"
              >
                Hasta 16
              </Link>
              <Link
                href="/propiedades?guests=22"
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-900 border border-orange-200 hover:bg-orange-50"
              >
                Hasta 22
              </Link>

              <Link
                href="/propiedades"
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-900 border border-orange-200 hover:bg-orange-50"
              >
                Ver todas
              </Link>

              <div className="ml-0 lg:ml-2 text-sm text-gray-700">
                <span className="font-bold">Filtro:</span>{" "}
                {guests > 0 ? `Grupos de ${guests}+` : "Sin filtro de personas"}
              </div>
            </div>
          </div>

          {/* Bloque derecho opcional (placeholder) */}
          <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-extrabold text-gray-900">Encuentra tu finca</div>
            <p className="mt-2 text-sm text-gray-600">
              Filtra por tamaño de grupo usando los botones de arriba.
            </p>
          </div>
        </div>

        {/* Cards */}
        <h2 className="mt-12 text-2xl font-extrabold text-gray-900">Elige por tamaño de grupo</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              className="group rounded-3xl border border-orange-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="relative h-56 w-full">
                <Image
                  src={p.heroImage}
                  alt={p.title}
                  fill
                  className="object-cover"
                  priority={false}
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-gray-900">
                  Hasta {p.capacity}
                </span>
              </div>

              <div className="p-5">
                <div className="text-sm text-gray-600">{p.locationLabel}</div>

                <div className="mt-2 text-lg font-extrabold text-gray-900 group-hover:underline">
                  {p.title}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(p.highlights ?? []).slice(0, 2).map((h) => (
                    <span
                      key={h}
                      className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-gray-800"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                <div className="mt-4 text-sm font-bold text-[#E76F51]">Ver detalles →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
