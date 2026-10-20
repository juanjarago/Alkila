import type { Metadata } from "next";
import SharedQuoteClient from "./SharedQuoteClient";
export const metadata: Metadata = {
  title: "Tu cotización | Alkila", description: "Consulta la propuesta que Alkila preparó para tu estadía.",
  robots: { index: false, follow: false, noarchive: true }, referrer: "no-referrer",
};
export default function SharedQuotePage() { return <SharedQuoteClient />; }
