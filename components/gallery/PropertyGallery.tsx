"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  title: string;
};

export default function PropertyGallery({ images, title }: Props) {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );

  const [active, setActive] = useState(0);
  const current = safeImages[active] ?? safeImages[0];

  if (!current) {
    return (
      <div className="rounded-2xl border border-orange-200 bg-gray-100 p-6 text-sm text-gray-600">
        No hay imágenes para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-3 min-[900px]:space-y-4">
      {/* Imagen principal: tamaño controlado para que no “explote” en pantallas grandes */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.35rem] border border-orange-200 bg-gray-200 min-[900px]:aspect-[16/9] min-[900px]:rounded-2xl">

        <Image
          src={current}
          alt={title}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 760px"
          className="object-cover"
        />
        <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
          {active + 1} / {safeImages.length}
        </span>
      </div>

      {/* Miniaturas */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {safeImages.map((img, i) => (
          <button
            key={img + i}
            type="button"
            onClick={() => setActive(i)}
            className={[
              "relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border transition min-[900px]:h-16 min-[900px]:w-24 min-[900px]:rounded-lg",
              i === active
                ? "border-orange-500 ring-2 ring-orange-300"
                : "border-orange-200 opacity-80 hover:opacity-100",
            ].join(" ")}
            aria-label={`Ver foto ${i + 1}`}
          >
            <Image src={img} alt={`${title} ${i + 1}`} fill sizes="96px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
