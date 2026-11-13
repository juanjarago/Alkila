import "./globals.css";
import type { Metadata, Viewport } from "next";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Alkila | Fincas en Anapoima y Apulo",
  description:
    "Casas y fincas privadas en Anapoima y Apulo según el tamaño de tu grupo. Piscinas, naturaleza y opciones pet friendly.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
