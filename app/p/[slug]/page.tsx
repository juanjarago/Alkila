import Link from "next/link";
import { notFound } from "next/navigation";
import PropertyGallery from "@/components/gallery/PropertyGallery";
import { properties } from "@/lib/properties";
import ReservationSidebar from "./ReservationSidebar";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const property = properties.find((p) => p.slug === slug);
  if (!property) return notFound();

  const images: string[] =
    (property as any).images && (property as any).images.length > 0
      ? (property as any).images
      : property.heroImage
        ? [property.heroImage]
        : [];

  return (
    <main>
      <div className="mx-auto max-w-6xl px-3 pt-4 min-[900px]:px-4 min-[900px]:pt-8">
        <div className="grid grid-cols-2 items-stretch gap-3 min-[900px]:flex min-[900px]:items-center min-[900px]:justify-between min-[900px]:gap-4">
          <Link
            href="/propiedades"
            className="grid min-h-12 place-items-center rounded-full border border-[#C6C0B1] bg-white px-3 text-center text-sm font-black leading-tight text-[#17332A] hover:text-[#66752F] min-[900px]:block min-[900px]:min-h-0 min-[900px]:border-0 min-[900px]:bg-transparent min-[900px]:p-0 min-[900px]:text-left"
          >
            Volver a propiedades
          </Link>

          <a
            href="#reserva"
            className="grid min-h-12 place-items-center rounded-full bg-[#B85F3B] px-4 text-center text-sm font-black leading-tight text-white shadow-sm transition hover:-translate-y-0.5 min-[900px]:block min-[900px]:min-h-0 min-[900px]:py-2"
          >
            Consultar disponibilidad
          </a>
        </div>

        <div className="mt-4 grid gap-4 min-[900px]:mt-6 min-[900px]:gap-6 lg:grid-cols-[1.3fr,0.7fr]">
          <section className="rounded-[1.5rem] border border-[#C6C0B1] bg-[#F4EFE2] p-4 shadow-sm min-[900px]:rounded-[2rem] min-[900px]:p-6">
            <div className="text-base font-bold text-[#66752F] min-[900px]:text-sm">
              {property.locationLabel ?? "Anapoima"}
            </div>

            <h1 className="mt-2 text-[1.7rem] font-black leading-[1.08] tracking-tight text-[#17332A] min-[900px]:text-4xl">
              {property.title}
            </h1>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 min-[900px]:flex-wrap min-[900px]:overflow-visible min-[900px]:pb-0">
              <span className="shrink-0 rounded-full bg-[#D8D5C9] px-3 py-2 text-sm font-black text-[#17332A] min-[900px]:py-1">
                Hasta {property.capacity} personas
              </span>

              {(property.highlights ?? []).slice(0, 6).map((h: string) => (
                <span
                  key={h}
                  className="shrink-0 rounded-full border border-[#C6C0B1] bg-white px-3 py-2 text-sm font-bold text-[#3F4741] min-[900px]:py-1"
                >
                  {h}
                </span>
              ))}
            </div>

            {images.length > 0 && (
              <div className="mt-4 min-[900px]:mt-6">
                <div className="mx-auto max-w-4xl">
                  <PropertyGallery images={images} title={property.title} />
                </div>
              </div>
            )}

            <div className="mt-6 min-[900px]:mt-8">
              <h2 className="text-2xl font-black text-[#17332A] min-[900px]:text-xl">
                Descripción
              </h2>
              <p className="mt-2 text-base leading-7 text-[#4B544D]">
                {property.description ??
                  "Un espacio ideal para disfrutar en familia y con amigos, rodeado de naturaleza y con todas las comodidades."}
              </p>
            </div>
          </section>

          <aside id="reserva" className="lg:sticky lg:top-6">
            <ReservationSidebar
              slug={property.slug}
              property={{
                title: property.title,
                capacity: property.capacity,
                staysListingId: property.staysListingId,
              }}
            />
          </aside>
        </div>
      </div>

      <div className="h-16" />
    </main>
  );
}
