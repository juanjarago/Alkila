import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import { properties } from "@/lib/properties";

export default function PropiedadesPage({
  searchParams,
}: {
  searchParams?: { guests?: string };
}) {
  const guests = Number(searchParams?.guests || 0);
  const filtered =
    guests > 0 ? properties.filter((p) => p.capacity >= guests) : properties;

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-[2rem] border border-[#E9D8A6] bg-[#FFFCF2]/86 p-6 shadow-sm backdrop-blur md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2A9DB0]">
            Fincas Alkila
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black tracking-tight text-[#1F3D2B] md:text-5xl">
            Elige el espacio ideal para tu grupo
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-700">
            Todas las propiedades están en Anapoima, con piscina privada,
            jacuzzi y zonas verdes para descansar en familia o con amigos.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {[
              ["Hasta 8", "/propiedades?guests=8"],
              ["Hasta 16", "/propiedades?guests=16"],
              ["Hasta 22", "/propiedades?guests=22"],
              ["Ver todas", "/propiedades"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-[#E9D8A6] bg-white px-4 py-2 text-sm font-black text-[#1F3D2B] transition hover:border-[#2A9DB0] hover:text-[#2A9DB0]"
              >
                {label}
              </Link>
            ))}

            <div className="text-sm font-semibold text-gray-700 md:ml-2">
              {guests > 0 ? `Mostrando grupos de ${guests}+` : "Sin filtro"}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.slug} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
