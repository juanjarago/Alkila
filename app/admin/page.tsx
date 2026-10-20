import Link from "next/link";
import AdminClient from "./AdminClient";
export default function AdminPage() {
  return <>
    <nav aria-label="Herramientas administrativas" className="mx-auto flex max-w-7xl justify-end px-4 pt-5 sm:px-6">
      <Link href="/admin/cotizaciones" className="rounded-xl bg-[#1F3D2B] px-5 py-3 font-semibold text-white">Cotizaciones · imagen y PDF</Link>
    </nav>
    <AdminClient />
  </>;
}
