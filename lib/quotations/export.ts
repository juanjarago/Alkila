import { formatCOP, formatDate, formatTimestamp, type PublicQuote } from "./model";
import { quotationPdf } from "./pdf";
export type DocumentQuote = Pick<PublicQuote, "number" | "createdAt" | "expiresAt" | "snapshot" | "hasPaymentLink" | "status">;
const W = 540, H = 960;
const GREEN = "#1F3D2B", CLAY = "#8F3F2A", PAPER = "#FFFDF8", MUTED = "#59685D";

async function localImage(path: string): Promise<HTMLImageElement> {
  // All image paths come from the server's property catalog, not user input.
  if (!(path === "/alkila-logo-approved.webp" || path.startsWith("/images/properties/")) || path.includes("..")) throw new Error("Ruta de imagen inválida.");
  const img = new Image();
  img.decoding = "async";
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => { img.src = ""; reject(new Error("La foto no cargó. Revisa tu conexión e intenta nuevamente.")); }, 15000);
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); reject(new Error("No se pudo cargar el logo o la foto original. Intenta nuevamente.")); };
    img.src = new URL(path, window.location.origin).href;
  });
}
export async function renderQuotation(quote: DocumentQuote, draft = false, loadImage: (path: string) => Promise<HTMLImageElement> = localImage): Promise<HTMLCanvasElement> {
  const [logo, photo] = await Promise.all([loadImage("/alkila-logo-approved.webp"), loadImage(quote.snapshot.propertyImage)]);
  const canvas = document.createElement("canvas");
  canvas.width = W * 2; canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Este navegador no permite generar la imagen.");
  ctx.scale(2, 2);
  const q = quote.snapshot;
  function box(x: number, y: number, w: number, h: number, fill: string, radius = 12) {
    ctx!.fillStyle = fill; ctx!.beginPath(); ctx!.roundRect(x, y, w, h, radius); ctx!.fill();
  }
  function text(value: string, x: number, y: number, size: number, color = GREEN, weight = "400", maxWidth = 484) {
    ctx!.font = `${weight} ${size}px Arial, sans-serif`; ctx!.fillStyle = color;
    while (ctx!.measureText(value).width > maxWidth && size > 11) { size -= 0.5; ctx!.font = `${weight} ${size}px Arial, sans-serif`; }
    ctx!.fillText(value, x, y);
  }
  function right(value: string, x: number, y: number, size: number, color = GREEN, weight = "400") {
    ctx!.textAlign = "right"; text(value, x, y, size, color, weight, 205); ctx!.textAlign = "left";
  }
  function contain(img: HTMLImageElement, x: number, y: number, w: number, h: number) {
    const s = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    ctx!.drawImage(img, x + (w - img.naturalWidth * s) / 2, y + (h - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
  }
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = CLAY; ctx.fillRect(0, 0, W, 6);
  contain(logo, 28, 19, 98, 88);
  right("COTIZACIÓN", 512, 44, 19, GREEN, "700");
  right(draft ? "VISTA PREVIA · SIN GUARDAR" : quote.number, 512, 66, 11, CLAY, "700");
  right(`Emitida ${formatTimestamp(quote.createdAt)}`, 512, 87, 10.5, MUTED);
  box(28, 114, 484, 168, "#F0EEE7");
  contain(photo, 28, 114, 484, 168); // Original photo: no crop, redraw or retouch.
  text(q.propertyTitle, 28, 310, 25, GREEN, "700");
  text(q.location, 28, 334, 13, MUTED);
  if (q.guestName) {
    const value = `Para: ${q.guestName}`;
    ctx.font = "600 14px Arial, sans-serif";
    let line = "", y = 355;
    for (const letter of value) {
      if (ctx.measureText(line + letter).width > 484) { text(line, 28, y, 14, GREEN, "600"); line = ""; y += 17; }
      line += letter;
    }
    text(line, 28, y, 14, GREEN, "600");
  }
  else text("Tu próxima escapada empieza aquí", 28, 363, 15, CLAY);
  box(28, 384, 235, 67, "#EDF1EB"); box(277, 384, 235, 67, "#EDF1EB");
  text("INGRESO", 42, 404, 10.5, MUTED, "700");
  text(formatDate(q.from), 42, 434, 19, GREEN, "700", 207);
  text("SALIDA", 291, 404, 10.5, MUTED, "700");
  text(formatDate(q.to), 291, 434, 19, GREEN, "700", 207);
  text(`${q.nights} ${q.nights === 1 ? "noche" : "noches"}   ·   ${q.guests} ${q.guests === 1 ? "huésped" : "huéspedes"}`, 28, 479, 16, GREEN, "600");
  text("DETALLE DE TU ESTADÍA", 28, 507, 11, MUTED, "700");
  q.lines.forEach((line, index) => {
    const y = 533 + index * 22;
    text(line.label, 28, y, 13, GREEN, "400", 298);
    right(formatCOP(line.amountCOP), 512, y, 14, GREEN, "600");
  });
  box(28, 686, 484, 69, GREEN);
  text("TOTAL · COP", 44, 713, 12, "#F7F6EA", "600");
  right(formatCOP(q.totalCOP), 496, 735, 30, "#FFFFFF", "700");
  text(q.payMode === "deposit" ? "Anticipo para reservar (30 %)" : "Pago total", 28, 782, 14, GREEN, "600", 280);
  right(formatCOP(q.payNowCOP), 512, 782, 18, GREEN, "700");
  text("Saldo restante", 28, 805, 13, MUTED);
  right(formatCOP(q.balanceCOP), 512, 805, 15, MUTED);
  box(28, 822, 484, 44, quote.status === "active" ? CLAY : MUTED, 10);
  ctx.textAlign = "center";
  text(draft ? "Guarda para compartir" : quote.status !== "active" ? "Cotización no vigente" : quote.hasPaymentLink ? "Ver cotización y continuar al pago" : "Abrir cotización", 270, 850, 16, "#FFFFFF", "700", 450);
  ctx.textAlign = "left";
  text(`Válida hasta ${formatTimestamp(quote.expiresAt)}`, 28, 890, 12, GREEN, "600");
  text("Hora de Colombia · alkila.co", 28, 909, 11, MUTED);
  text("Sujeta a disponibilidad. Cotizar no bloquea fechas.", 28, 934, 12, MUTED);
  text("No es una reserva confirmada ni un comprobante de pago.", 28, 951, 11, MUTED);
  return canvas;
}
export function canvasBlob(canvas: HTMLCanvasElement, type = "image/png"): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("No se pudo exportar el documento.")), type, 0.95));
}
export async function pdfBlob(canvas: HTMLCanvasElement, shareUrl?: string) {
  const jpeg = new Uint8Array(await (await canvasBlob(canvas, "image/jpeg")).arrayBuffer());
  const pdf = quotationPdf(jpeg, canvas.width, canvas.height, shareUrl);
  const buffer = new ArrayBuffer(pdf.byteLength);
  new Uint8Array(buffer).set(pdf);
  return new Blob([buffer], { type: "application/pdf" });
}
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
