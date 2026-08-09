import "./globals.css";
import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Alkila | Fincas en Anapoima",
  description:
    "Fincas privadas en Anapoima según el tamaño de tu grupo. Piscina, jacuzzi, naturaleza y espacios pet friendly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="site-nature-bg min-h-screen text-gray-900">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
