import { BrandLogo } from "./BrandLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#C6C0B1]/80 bg-[#D8D5C9]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <BrandLogo compact />

        <nav className="hidden items-center gap-6 text-sm font-black text-[#17332A] md:flex">
          <a className="transition hover:text-[#66752F]" href="/propiedades">
            Propiedades
          </a>
          <a className="transition hover:text-[#66752F]" href="/destinos/anapoima">
            Anapoima
          </a>
        </nav>
      </div>
    </header>
  );
}
