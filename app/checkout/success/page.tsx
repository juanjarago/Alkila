import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#FFF7ED]">
      <div className="mx-auto max-w-xl px-4 pt-14">
        <div className="rounded-3xl border border-green-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-gray-900">✅ Pago confirmado</h1>
          <p className="mt-2 text-gray-700">
            Recibimos tu pago. En breve te contactaremos para confirmar tu reserva.
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/propiedades"
              className="rounded-2xl bg-[#E76F51] px-5 py-3 text-sm font-extrabold text-white hover:opacity-90"
            >
              Ver propiedades
            </Link>

            <a
              href="https://wa.me/57TU_NUMERO_AQUI?text=Hola%20👋%20Ya%20realicé%20el%20pago%20en%20Alkila%2C%20%C2%BFme%20ayudas%20a%20confirmar%20la%20reserva%3F"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-extrabold text-white hover:opacity-90"
            >
              Confirmar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
