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
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/propiedades"
            className="text-sm font-bold text-[#1F3D2B] hover:text-[#2A9DB0]"
          >
            Volver a propiedades
          </Link>

          <a
            href="#reserva"
            className="rounded-full bg-[#E76F51] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5"
          >
            Consultar disponibilidad
          </a>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
          <section className="rounded-[2rem] border border-[#E9D8A6] bg-[#FFFCF2] p-5 shadow-sm md:p-6">
            <div className="text-sm font-bold text-[#2A9DB0]">
              {property.locationLabel ?? "Anapoima"}
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1F3D2B] md:text-4xl">
              {property.title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#FDF2D0] px-3 py-1 text-sm font-black text-[#1F3D2B]">
                Hasta {property.capacity} personas
              </span>

              {(property.highlights ?? []).slice(0, 6).map((h: string) => (
                <span
                  key={h}
                  className="rounded-full border border-[#E9D8A6] bg-white px-3 py-1 text-sm font-bold text-gray-800"
                >
                  {h}
                </span>
              ))}
            </div>

            {images.length > 0 && (
              <div className="mt-6">
                <div className="mx-auto max-w-4xl">
                  <PropertyGallery images={images} title={property.title} />
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-black text-[#1F3D2B]">
                Descripción
              </h2>
              <p className="mt-2 leading-relaxed text-gray-700">
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
