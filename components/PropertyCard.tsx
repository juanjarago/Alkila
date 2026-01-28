import Link from "next/link";
import Image from "next/image";

type Property = {
  slug: string;
  title: string;
  heroImage: string;
  capacity: number;
  locationLabel: string;
  highlights: string[];
};

export function PropertyCard({ p }: { p: Property }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm transition hover:shadow-lg">
      <Link href={`/p/${p.slug}`} className="block">
        <div className="relative h-56 w-full">
          <Image
            src={p.heroImage}
            alt={p.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">
              Hasta {p.capacity}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="text-sm text-gray-600">{p.locationLabel}</div>
          <h3 className="mt-1 text-lg font-extrabold leading-tight">{p.title}</h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {p.highlights.slice(0, 3).map((h) => (
              <span
                key={h}
                className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-gray-800"
              >
                {h}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#E76F51]">
              Ver detalles →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
