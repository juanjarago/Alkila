"use client";

import Script from "next/script";
import { useRef } from "react";

const FORM_ID = "263094791480060";
export const BILLIARD_FORM_URL = `https://form.jotform.com/${FORM_ID}`;

type JotformWindow = Window & {
  jotformEmbedHandler?: (selector: string, origin: string) => void;
};

export function BilliardForm() {
  const initialized = useRef(false);

  function initializeEmbed() {
    const handler = (window as JotformWindow).jotformEmbedHandler;
    if (!initialized.current && handler) {
      handler(`iframe[id='JotFormIFrame-${FORM_ID}']`, "https://form.jotform.com/");
      initialized.current = true;
    }
  }

  return (
    <section aria-label="Formulario de entrega de billar">
      <div className="overflow-hidden rounded-2xl border border-[#C6C0B1] bg-white shadow-sm sm:rounded-3xl">
        <iframe
          id={`JotFormIFrame-${FORM_ID}`}
          title="Entrega de billar: revisión, fotos y firma"
          src={`${BILLIARD_FORM_URL}?isIframeEmbed=1`}
          allow="camera"
          scrolling="yes"
          className="block w-full border-0"
          style={{ height: 950 }}
        />
      </div>
      <Script
        id="jotform-embed-handler"
        src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"
        strategy="afterInteractive"
        onReady={initializeEmbed}
      />
      <p className="mt-4 text-center text-sm leading-6 text-[#4B544D]">
        ¿No puedes ver el formulario?{" "}
        <a
          href={BILLIARD_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[#17332A] underline underline-offset-4"
        >
          Abrir en otra pestaña
        </a>
      </p>
    </section>
  );
}
