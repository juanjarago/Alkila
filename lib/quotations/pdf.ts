/** Single-page image PDF. No network calls or extra dependencies.
 * Coordinates use the document's 540 x 960 logical canvas. The PDF link goes
 * to the guarded quotation page, never directly to a payment provider.
 */
export function quotationPdf(jpeg: Uint8Array, imageWidth: number, imageHeight: number, shareUrl?: string): Uint8Array {
  if (!jpeg.length || imageWidth < 1 || imageHeight < 1) throw new Error("Imagen PDF inválida.");
  if (shareUrl && (!/^https?:\/\//.test(shareUrl) || shareUrl.length > 4096)) throw new Error("Enlace PDF inválido.");
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets = [0];
  let length = 0;
  function append(value: string | Uint8Array) {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    chunks.push(bytes); length += bytes.length;
  }
  function object(n: number, value: string) {
    offsets[n] = length; append(`${n} 0 obj\n${value}\nendobj\n`);
  }
  append("%PDF-1.4\n");
  append(new Uint8Array([37, 226, 227, 207, 211, 10]));
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 360 640] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R${shareUrl ? " /Annots [6 0 R]" : ""} >>`);
  const stream = "q\n360 0 0 640 0 0 cm\n/Im0 Do\nQ\n";
  object(4, `<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}endstream`);
  offsets[5] = length;
  append(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  append(jpeg); append("\nendstream\nendobj\n");
  if (shareUrl) {
    const uri = Array.from(encoder.encode(shareUrl), (byte) => byte.toString(16).padStart(2, "0")).join("");
    object(6, `<< /Type /Annot /Subtype /Link /Rect [18.667 62.667 341.333 92] /Border [0 0 0] /A << /S /URI /URI <${uri}> >> >>`);
  }
  const xref = length;
  append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  for (let i = 1; i < offsets.length; i++) append(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const result = new Uint8Array(length);
  let position = 0;
  for (const chunk of chunks) { result.set(chunk, position); position += chunk.length; }
  return result;
}
