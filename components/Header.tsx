import { BrandLogo } from "./BrandLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#C6C0B1]/80 bg-[#D8D5C9]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <BrandLogo compact />

        <nav className="hidden items-center gap-6 text-sm font-black text-[#17332A] md:flex">
          <a className="transition hover:text-[#66752F]" href="/propiedades">
            Propiedades
          </a>
          <a className="transition hover:text-[#66752F]" href="/destinos/anapoima">
            Anapoima
          </a>
        </nav>

        <nav className="flex shrink-0 items-center gap-2 text-xs font-black text-[#17332A] md:hidden">
          <a
            className="rounded-full border border-[#C6C0B1] bg-white px-3 py-2"
            href="/#propiedades"
          >
            Fincas
          </a>
          <a
            className="rounded-full bg-[#B85F3B] px-3 py-2 text-white"
            href="https://wa.me/573014000436?text=Hola%2C%20quiero%20ayuda%20para%20escoger%20una%20finca%20en%20Alkila."
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
