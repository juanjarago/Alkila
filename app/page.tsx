import Image from "next/image";
import { properties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";

export default function Home() {
  const ordered = properties.slice().sort((a, b) => a.capacity - b.capacity);

  return (
    <main>
      <section className="px-4 pb-8 pt-5 md:py-14">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.88fr,1.12fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#66752F] md:text-sm">
              Fincas privadas en Anapoima
            </p>

            <h1 className="mt-3 text-4xl font-black leading-[0.98] tracking-tight text-[#17332A] md:mt-5 md:max-w-2xl md:text-7xl">
              Elige tu finca y cotiza tu estadía
            </h1>

            <p className="mt-4 text-base leading-7 text-[#3F4741] md:mt-6 md:max-w-xl md:text-lg md:leading-8">
              Tres espacios privados con piscina, jacuzzi y naturaleza para
              descansar en Anapoima. Escoge por tamaño de grupo y revisa fechas
              disponibles en la ficha de cada propiedad.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-black sm:flex sm:flex-wrap sm:text-sm">
              {["Piscina privada", "Jacuzzi", "Pet friendly", "Buen clima"].map(
                (chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[#C6C0B1] bg-white px-3 py-2 text-center text-[#17332A] sm:px-4"
                  >
                    {chip}
                  </span>
                )
              )}
            </div>

            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
              <a
                href="#propiedades"
                className="rounded-full bg-[#B85F3B] px-6 py-3 text-center text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5"
              >
                Ver las 3 opciones
              </a>
              <a
                href="https://wa.me/573014000436?text=Hola%2C%20quiero%20ayuda%20para%20escoger%20una%20finca%20en%20Alkila."
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#17332A] bg-white px-6 py-3 text-center text-sm font-black text-[#17332A] transition hover:-translate-y-0.5"
              >
                Pedir ayuda por WhatsApp
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="grid gap-3 sm:grid-cols-[1.12fr,0.88fr] md:gap-4">
              <div className="relative min-h-[19rem] overflow-hidden rounded-[1.7rem] border border-[#C6C0B1] bg-[#D8D5C9] shadow-sm md:min-h-[30rem] md:rounded-[2rem]">
                <Image
                  src="/images/properties/finca-anapoima-22-personas/20.webp"
                  alt="Vista de la finca Alkila con paisaje de Anapoima"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 md:gap-4">
                <div className="relative min-h-[8.5rem] overflow-hidden rounded-[1.4rem] border border-[#C6C0B1] bg-[#D8D5C9] shadow-sm md:min-h-[14rem] md:rounded-[2rem]">
                  <Image
                    src="/images/brand/pool-framed.webp"
                    alt="Piscina privada rodeada de naturaleza"
                    fill
                    sizes="(max-width: 768px) 50vw, 28vw"
                    className="object-cover"
                  />
                </div>

                <div className="relative min-h-[8.5rem] overflow-hidden rounded-[1.4rem] border border-[#C6C0B1] bg-[#D8D5C9] shadow-sm md:min-h-[14rem] md:rounded-[2rem]">
                  <Image
                    src="/images/brand/rainbow-house.webp"
                    alt="Casa privada Alkila en Anapoima"
                    fill
                    sizes="(max-width: 768px) 50vw, 28vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="propiedades"
        className="border-y border-[#D6D0C1] bg-white/72 px-4 py-8 md:py-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-3 md:grid-cols-[0.9fr,1.1fr] md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#66752F] md:text-sm">
                Escoge y cotiza
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#17332A] md:text-4xl">
                Tres opciones según tu grupo
              </h2>
            </div>
            <p className="text-sm leading-6 text-[#4B544D]">
              Entra a la propiedad que te guste, revisa el calendario y cotiza
              con el número de personas antes de pagar o escribirnos.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {ordered.map((p) => (
              <PropertyCard key={p.slug} p={p} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
