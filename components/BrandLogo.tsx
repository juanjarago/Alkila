import Link from "next/link";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3"
      aria-label="Alkila"
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FDF2D0] shadow-sm ring-1 ring-[#E9D8A6] transition group-hover:-translate-y-0.5">
        <svg viewBox="0 0 64 64" aria-hidden="true" className="h-10 w-10">
          <circle cx="45" cy="17" r="8" fill="#F7B955" />
          <path
            d="M7 44c8-15 17-24 27-24 8 0 15 5 23 15v22H7V44Z"
            fill="#2F6F4E"
          />
          <path
            d="M7 48c8-8 16-12 24-12s17 4 26 12v9H7v-9Z"
            fill="#7BB661"
          />
          <path
            d="M12 47c5 5 11 5 16 0s11-5 16 0 9 5 12 2v8H12V47Z"
            fill="#2A9DB0"
          />
          <circle cx="19" cy="20" r="2.5" fill="#1F3D2B" />
          <circle cx="27" cy="18" r="2.5" fill="#1F3D2B" />
          <circle cx="23" cy="25" r="4" fill="#1F3D2B" />
          <path
            d="M17 37c3-5 7-8 12-8 4 0 8 2 11 6"
            fill="none"
            stroke="#FDF2D0"
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
      </span>

      <span className={compact ? "hidden sm:block" : "block"}>
        <span className="block text-xl font-black leading-none tracking-tight text-[#1F3D2B]">
          Alkila
        </span>
        <span className="mt-1 block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#2A9DB0]">
          Anapoima natural
        </span>
      </span>
    </Link>
  );
}
