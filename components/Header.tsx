export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-orange-200 bg-[#FFF7ED]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/" className="text-lg font-extrabold tracking-tight">
          Alkila<span className="text-[#E76F51]">.</span>
        </a>

        <nav className="hidden gap-6 text-sm font-semibold md:flex">
          <a className="hover:opacity-80" href="/propiedades">Propiedades</a>
          <a className="hover:opacity-80" href="/destinos/anapoima">Anapoima</a>
        </nav>


      </div>
    </header>
  );
}
