import Link from "next/link";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center"
      aria-label="Alkila | Casas y fincas"
    >
      <img
        src="/alkila-logo-approved.webp"
        alt="Alkila — Casas y fincas"
        width={207}
        height={185}
        className={compact ? "h-auto w-[148px] sm:w-[164px]" : "h-auto w-[164px]"}
      />
    </Link>
  );
}
