"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import WhatsAppFloating from "./whatsapp/WhatsAppFloating";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header />
      {children}
      <WhatsAppFloating />
    </>
  );
}
