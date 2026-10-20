import type { Metadata } from "next";
import AdminQuotesClient from "./AdminQuotesClient";
export const metadata: Metadata = {
  title: "Cotizaciones | Administración Alkila",
  robots: { index: false, follow: false }, referrer: "no-referrer",
};
export default function AdminQuotesPage() { return <AdminQuotesClient />; }
