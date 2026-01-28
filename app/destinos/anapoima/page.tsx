import { SearchBar } from "@/components/SearchBar";
import { properties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";

export default function AnapoimaPage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-extrabold">Fincas y casas rurales en Anapoima</h1>
        <p className="mt-2 text-gray-700">Descanso cerca de Bogotá con clima cálido, naturaleza y privacidad.</p>

        <div className="mt-6">
          <SearchBar />
        </div>

        <div className="mt-10 rounded-2xl border border-orange-200 bg-white p-6">
          <h2 className="text-xl font-extrabold">¿Por qué Anapoima?</h2>
          <p className="mt-2 text-gray-700">
            Anapoima es ideal para escapadas en familia o con amigos: clima cálido, naturaleza y planes tranquilos para desconectarse.
            En Alkila encuentras fincas privadas según el tamaño de tu grupo, con piscina y jacuzzi privados, y opción pet friendly con tarifa adicional.
          </p>
        </div>

        <h2 className="mt-10 text-2xl font-extrabold">Propiedades</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {properties.slice().sort((a, b) => a.capacity - b.capacity).map((p) => (
            <PropertyCard key={p.slug} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
