import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { properties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";

export default function Home() {
  const ordered = properties.slice().sort((a, b) => a.capacity - b.capacity);

  return (
    <main>
      <section className="relative overflow-hidden px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.86fr,1.14fr] lg:items-center">
          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#66752F]">
              Fincas privadas en Anapoima
            </p>

            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.98] tracking-tight text-[#17332A] md:text-7xl">
              Naturaleza, piscina y descanso privado
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#3F4741]">
              Reserva directo espacios pensados para compartir con familia y
              amigos: vistas abiertas, clima cálido, agua y privacidad.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 text-sm font-black">
              {["Piscina privada", "Vista natural", "Pet friendly", "Reserva directa"].map(
                (chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[#C6C0B1] bg-white px-4 py-2 text-[#17332A]"
                  >
                    {chip}
                  </span>
                )
              )}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/propiedades"
                className="rounded-full bg-[#B85F3B] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5"
              >
                Ver fincas
              </Link>
              <a
                href="#buscar"
                className="rounded-full border border-[#17332A] bg-white px-6 py-3 text-sm font-black text-[#17332A] transition hover:-translate-y-0.5"
              >
                Consultar fechas
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-4 sm:grid-cols-[1.1fr,0.9fr]">
              <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-[#C6C0B1] bg-[#D8D5C9] shadow-sm">
                <Image
                  src="/images/brand/rainbow-house.webp"
                  alt="Vista de la finca Alkila con arcoíris y paisaje de Anapoima"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>

              <div className="grid gap-4">
                <div className="relative min-h-[13rem] overflow-hidden rounded-[2rem] border border-[#C6C0B1] bg-[#D8D5C9] shadow-sm">
                  <Image
                    src="/images/brand/pool-framed.webp"
                    alt="Piscina privada rodeada de naturaleza"
                    fill
                    sizes="(max-width: 768px) 100vw, 28vw"
                    className="object-cover"
                  />
                </div>

                <div id="buscar">
                  <SearchBar />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#D6D0C1] bg-white/72 px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#66752F]">
              Elige por tamaño de grupo
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#17332A]">
              Tres espacios para desconectarte
            </h2>
          </div>
          <p className="text-sm leading-6 text-[#4B544D] md:col-span-2">
            Desde una cabaña privada para planes pequeños hasta una finca grande
            para grupos familiares, todas con piscina y zonas para descansar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {ordered.map((p) => (
            <PropertyCard key={p.slug} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
