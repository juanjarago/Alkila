import Link from "next/link";
import Image from "next/image";

type Property = {
  slug: string;
  title: string;
  heroImage: string;
  capacity: number;
  locationLabel: string;
  highlights: string[];
  airbnbRating?: number;
  airbnbReviewCount?: number;
};

export function PropertyCard({ p }: { p: Property }) {
  return (
    <div className="group overflow-hidden rounded-[1.6rem] border border-[#C6C0B1] bg-[#F4EFE2] shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#17332A]/10">
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
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-[#D8D5C9]/95 px-3 py-1 text-xs font-black text-[#17332A]">
              Hasta {p.capacity}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="text-sm font-bold text-[#66752F]">
            {p.locationLabel}
          </div>
          <h3 className="mt-1 text-lg font-black leading-tight text-[#17332A]">
            {p.title}
          </h3>

          {p.airbnbRating != null && p.airbnbReviewCount != null ? (
            <div className="mt-3 text-sm font-black text-[#17332A]">
              <span aria-hidden="true" className="text-[#B85F3B]">★</span>{" "}
              {p.airbnbRating.toLocaleString("es-CO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              · {p.airbnbReviewCount} reseñas en Airbnb
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {p.highlights.slice(0, 3).map((h) => (
              <span
                key={h}
                className="rounded-full border border-[#C6C0B1] bg-white px-3 py-1 text-xs font-bold text-[#3F4741]"
              >
                {h}
              </span>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-[#B85F3B] px-4 py-3 text-center text-sm font-black text-white transition group-hover:-translate-y-0.5">
            Cotizar y reservar
          </div>
        </div>
      </Link>
    </div>
  );
}
