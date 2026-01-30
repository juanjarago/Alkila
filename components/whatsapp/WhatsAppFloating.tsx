"use client";

export default function WhatsAppFloating() {
  const message = encodeURIComponent(
    "Hola 👋 Estoy visitando Alkila y quiero información para reservar una propiedad en Anapoima."
  );

  return (
    <a
      href={`https://wa.me/573014000436?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-green-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg hover:opacity-90"
    >
      💬 Confirma Disponibilidad
    </a>
  );
}
