import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import WhatsAppFloating from "../components/whatsapp/WhatsAppFloating";

export const metadata: Metadata = {
  title: "Alkila | Fincas en Anapoima",
  description: "Fincas privadas en Anapoima según el tamaño de tu grupo. Piscina y jacuzzi privados. Pet friendly con tarifa adicional."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="text-gray-900">
        <Header />
        {children}
	<WhatsAppFloating />
      </body>
    </html>
  );
}
