import type { Metadata } from "next";
import Link from "next/link";
import { BilliardForm } from "@/components/guests/BilliardForm";

export const metadata: Metadata = {
  title: "Entrega de billar | Huéspedes Alkila",
  description: "Revisa la mesa, registra sus fotos y firma el acta de entrega desde tu celular.",
  robots: { index: false, follow: true },
};

export default function BilliardPage() {
  return (
    <main className="px-3 pb-12 pt-6 sm:px-6 sm:pt-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm font-bold text-[#4B544D] underline-offset-4 hover:underline"
        >
          ← Volver a Alkila
        </Link>
        <header className="mb-6 mt-3 sm:mb-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#66752F]">
            Para nuestros huéspedes
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#17332A] sm:text-4xl">
            Entrega de la mesa de billar
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#4B544D]">
            Antes de jugar, revisa la mesa y sus accesorios, toma las fotos y
            firma el acta. Ten a mano el número de reserva de la app donde reservaste.
          </p>
        </header>
        <BilliardForm />
        <p className="mt-8 text-center text-sm leading-6 text-[#4B544D]">
          Al terminar, la administración revisará contigo la mesa y sus accesorios
          para registrar la devolución.
        </p>
      </div>
    </main>
  );
}
