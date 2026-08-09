import { BrandLogo } from "./BrandLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E9D8A6]/70 bg-[#FFFCF2]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <BrandLogo compact />

        <nav className="hidden items-center gap-6 text-sm font-bold text-[#1F3D2B] md:flex">
          <a className="transition hover:text-[#2A9DB0]" href="/propiedades">
            Propiedades
          </a>
          <a className="transition hover:text-[#2A9DB0]" href="/destinos/anapoima">
            Anapoima
          </a>
        </nav>
      </div>
    </header>
  );
}
