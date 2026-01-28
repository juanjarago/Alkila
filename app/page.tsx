import { SearchBar } from "@/components/SearchBar";
import { properties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";

export default function Home() {
  const ordered = properties.slice().sort((a, b) => a.capacity - b.capacity);

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Fincas privadas en Anapoima según el tamaño de tu grupo
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Piscina y jacuzzi privados · Pet friendly con tarifa adicional · Reserva segura
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-white px-3 py-1">Hasta 8</span>
              <span className="rounded-full bg-white px-3 py-1">Hasta 16</span>
              <span className="rounded-full bg-white px-3 py-1">Hasta 22</span>
            </div>
          </div>

          <SearchBar />
        </div>

        <hr className="my-10 border-orange-200" />

        <h2 className="text-2xl font-extrabold">Elige por tamaño de grupo</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ordered.map((p) => (
            <PropertyCard key={p.slug} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
