import Link from "next/link";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3"
      aria-label="Alkila"
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.05rem] bg-[#D8D5C9] shadow-sm ring-1 ring-[#A9A59A] transition group-hover:-translate-y-0.5">
        <svg viewBox="0 0 64 64" aria-hidden="true" className="h-10 w-10">
          <path
            d="M22 12c9-3 17 0 23 8-10 2-18 0-23-8Z"
            fill="#66752F"
          />
          <path
            d="M45 15c3-2 6-1 8 2-3 2-6 2-8-2Z"
            fill="#B8794A"
          />
          <path
            d="M17 33 32 21l15 12v19H17V33Z"
            fill="#17332A"
          />
          <path
            d="M23 33 32 26l9 7v15H23V33Z"
            fill="#D8D5C9"
          />
          <path
            d="M32 35c4 3 7 7 9 13H23c2-6 5-10 9-13Z"
            fill="#B85F3B"
          />
          <path
            d="M25 35h14"
            fill="none"
            stroke="#17332A"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
          <path d="M31 31h2v6h-2z" fill="#17332A" />
          <path d="M28 42h8v2h-8z" fill="#D8D5C9" opacity="0.85" />
        </svg>
      </span>

      <span className={compact ? "hidden sm:block" : "block"}>
        <span className="block text-2xl font-black uppercase leading-none tracking-[0.04em] text-[#17332A]">
          Alkila
        </span>
        <span className="mt-1 block text-[0.58rem] font-black uppercase tracking-[0.16em] text-[#66752F]">
          Anapoima, Colombia
        </span>
      </span>
    </Link>
  );
}
