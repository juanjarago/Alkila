"use client";

export default function WhatsAppFloating() {
  const message = encodeURIComponent(
    "Hola, estoy visitando Alkila y quiero información para reservar una propiedad en Anapoima."
  );

  return (
    <a
      href={`https://wa.me/573014000436?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full bg-[#66752F] px-4 py-3 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 sm:bottom-5 sm:right-5 sm:text-sm lg:px-4"
    >
      <span aria-hidden="true">💬</span>
      <span className="hidden sm:inline">Confirmar disponibilidad</span>
      <span className="sm:hidden">WhatsApp</span>
    </a>
  );
}
