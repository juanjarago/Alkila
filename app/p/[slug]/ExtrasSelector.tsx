"use client";

import { useState } from "react";

const EXTRAS = [
  { id: "decoracion", label: "Decoración especial" },
  { id: "mascotas", label: "Mascotas" },
  { id: "aseo", label: "Aseo adicional" },
  { id: "transporte", label: "Transporte" },
  { id: "chef", label: "Chef / Parrillero (consultar)" },
];

export default function ExtrasSelector({
  onChange,
}: {
  onChange?: (extras: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    const updated = selected.includes(id)
      ? selected.filter((e) => e !== id)
      : [...selected, id];

    setSelected(updated);
    onChange?.(updated);
  };

  return (
    <section className="mt-10 border-t pt-8">
      <h3 className="text-lg font-extrabold text-gray-900">
        ✨ Mejora tu estadía{" "}
        <span className="text-sm font-normal text-gray-500">(opcional)</span>
      </h3>

      <p className="mt-1 text-sm text-gray-600">
        Personaliza tu experiencia en Anapoima con servicios adicionales.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {EXTRAS.map((extra) => {
          const isSelected = selected.includes(extra.id);

          return (
            <button
              type="button"
              key={extra.id}
              onClick={() => toggle(extra.id)}
              className={`relative w-full rounded-2xl border p-4 text-left transition
                ${
                  isSelected
                    ? "border-[#C97A5D] bg-white shadow-md"
                    : "border-orange-200 bg-[#FAFAF8] hover:bg-white"
                }`}
            >
              {isSelected && (
                <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#C97A5D] text-sm font-bold text-white">
                  ✓
                </span>
              )}

              <div className="min-h-[44px]">
                <div className="text-sm font-extrabold text-gray-900 leading-snug">
                  {extra.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Puedes seleccionar uno o varios servicios.
      </p>
    </section>
  );
}