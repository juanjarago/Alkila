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
    <div className="group overflow-hidden rounded-[1.75rem] border border-[#E9D8A6] bg-[#FFFCF2] shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1F3D2B]/10">
      <Link href={`/p/${p.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={p.heroImage}
            alt={p.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F3D2B]/70 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="rounded-full bg-[#FDF2D0]/95 px-3 py-1 text-xs font-black text-[#1F3D2B]">
              Hasta {p.capacity}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="text-sm font-semibold text-[#2A9DB0]">
            {p.locationLabel}
          </div>
          <h3 className="mt-1 text-lg font-black leading-tight text-[#1F3D2B]">
            {p.title}
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {p.highlights.slice(0, 3).map((h) => (
              <span
                key={h}
                className="rounded-full border border-[#E9D8A6] bg-white px-3 py-1 text-xs font-bold text-gray-800"
              >
                {h}
              </span>
            ))}
          </div>

          <div className="mt-5 text-sm font-black text-[#E76F51]">
            Ver detalles
          </div>
        </div>
      </Link>
    </div>
  );
}
