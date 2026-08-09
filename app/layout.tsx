import "./globals.css";
import type { Metadata, Viewport } from "next";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Alkila | Fincas en Anapoima",
  description:
    "Fincas privadas en Anapoima según el tamaño de tu grupo. Piscina, jacuzzi, naturaleza y espacios pet friendly.",
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
