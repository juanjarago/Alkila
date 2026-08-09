import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { properties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";

export default function Home() {
  const ordered = properties.slice().sort((a, b) => a.capacity - b.capacity);

  return (
    <main>
      <section className="nature-band relative min-h-[78vh] overflow-hidden">
        <Image
          src="/images/properties/finca-anapoima-22-personas/01.webp"
          alt="Finca Alkila en Anapoima con piscina y naturaleza"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#123222]/88 via-[#123222]/58 to-[#123222]/18" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFaf0] via-transparent to-transparent" />

        <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 pb-24 pt-16 lg:grid-cols-[1.04fr,0.72fr] lg:items-center">
          <div className="max-w-3xl text-white">
            <div className="mb-5 inline-flex items-center rounded-full border border-white/35 bg-white/16 px-4 py-2 text-sm font-bold backdrop-blur">
              Anapoima, naturaleza y descanso privado
            </div>

            <h1 className="text-5xl font-black tracking-tight md:text-7xl">
              Alkila
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-white/92 md:text-xl">
              Fincas privadas para descansar con piscina, jacuzzi, buen clima,
              zonas verdes y espacios pet friendly para compartir sin afanes.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold">
              <span className="rounded-full bg-white/92 px-4 py-2 text-[#1F3D2B]">
                Piscina privada
              </span>
              <span className="rounded-full bg-white/92 px-4 py-2 text-[#1F3D2B]">
                Zonas verdes
              </span>
              <span className="rounded-full bg-white/92 px-4 py-2 text-[#1F3D2B]">
                Pet friendly
              </span>
              <span className="rounded-full bg-white/92 px-4 py-2 text-[#1F3D2B]">
                Buen clima
              </span>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/propiedades"
                className="rounded-full bg-[#F7B955] px-6 py-3 text-sm font-black text-[#1F3D2B] shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
              >
                Ver fincas
              </Link>
              <a
                href="#buscar"
                className="rounded-full border border-white/60 bg-white/12 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
              >
                Consultar fechas
              </a>
            </div>
          </div>

          <div id="buscar" className="lg:justify-self-end">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2A9DB0]">
              Elige por tamaño de grupo
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1F3D2B] md:text-4xl">
              Tres espacios para desconectarte
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-gray-700">
            Desde una cabaña privada para planes pequeños hasta una finca grande
            para grupos familiares, todas con piscina y zonas para descansar.
          </p>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {ordered.map((p) => (
            <PropertyCard key={p.slug} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
