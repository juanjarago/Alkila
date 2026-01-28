import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FFF7ED] p-10">
      <h1 className="text-3xl font-extrabold">Propiedad no encontrada</h1>
      <p className="mt-2 text-gray-700">Revisa el enlace o vuelve al listado.</p>
      <Link className="mt-6 inline-block rounded-2xl bg-white px-4 py-3 font-bold" href="/propiedades">
        Volver a propiedades
      </Link>
    </main>
  );
}
