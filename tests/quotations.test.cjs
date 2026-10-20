// Run after npm ci: node --test tests/quotations.test.cjs
// Real quotation modules, mocked existing pricing/availability and Supabase I/O.
// Never connects to production or creates real reservations/payment preferences.
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const property = { slug: "casa-campestre-anapoima-16-personas", shortTitle: "Casa campestre (hasta 16)", capacity: 16,
  heroImage: "/images/properties/casa-campestre-anapoima-16-personas/05.webp", locationLabel: "Anapoima" };
let rows, requests, conflicts, pricingChange;
const availability = { collectAvailabilityConflicts: async () => conflicts };
const pricing = { quoteDirectStay: async (input) => {
  const nights = (Date.parse(input.to) - Date.parse(input.from)) / 86400000;
  const extras = input.extras || [];
  const subtotalCOP = 500000 * nights + pricingChange;
  const selected = (id, amount) => extras.includes(id) ? amount : 0;
  const quote = { ...input, nights, minNights: 1, subtotalCOP, cleaningFeeCOP: 100000, extraGuestFeeCOP: input.guests > 12 ? (input.guests - 12) * 50000 * nights : 0,
    petFeeCOP: selected("pets", 50000), domesticServiceFeeCOP: selected("domestic_service", 90000 * nights),
    earlyCheckInFeeCOP: selected("early_checkin", 250000), lateCheckoutFeeCOP: selected("late_checkout", 250000), extras, blocked: false, conflicts: [] };
  quote.extrasFeeCOP = quote.petFeeCOP + quote.domesticServiceFeeCOP + quote.earlyCheckInFeeCOP + quote.lateCheckoutFeeCOP;
  quote.totalCOP = subtotalCOP + quote.cleaningFeeCOP + quote.extraGuestFeeCOP + quote.extrasFeeCOP;
  return quote;
} };
class AdminAuthError extends Error {}
const auth = { AdminAuthError, assertAdmin(req) { if (req.headers.get("x-admin-token") !== "test-only-admin") throw new AdminAuthError(); } };
const oldLoad = Module._load;
Module._load = function(request, parent, isMain) {
  const resolved = request.startsWith("@/") ? path.join(root, request.slice(2)) : request.startsWith(".") && parent ? path.resolve(path.dirname(parent.filename), request) : "";
  if (resolved === path.join(root, "lib/properties")) return { properties: [property] };
  if (resolved === path.join(root, "lib/booking/availability")) return availability;
  if (resolved === path.join(root, "lib/booking/pricing")) return pricing;
  if (resolved === path.join(root, "lib/admin/auth")) return auth;
  return oldLoad.call(this, request.startsWith("@/") ? resolved : request, parent, isMain);
};
Module._extensions[".ts"] = function(module, filename) {
  const result = ts.transpileModule(fs.readFileSync(filename, "utf8"), { fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  module._compile(result.outputText, filename);
};
const model = require("../lib/quotations/model.ts");
const service = require("../lib/quotations/service.ts");
const store = require("../lib/quotations/store.ts");
const http = require("../lib/quotations/http.ts");
const admin = require("../app/api/admin/quotes/route.ts");
const view = require("../app/api/quotes/view/route.ts");
const payment = require("../app/api/quotes/payment/route.ts");
const { quotationPdf } = require("../lib/quotations/pdf.ts");
const input = () => ({ propertySlug: property.slug, from: "2035-03-20", to: "2035-03-23", guests: 12,
  guestName: "Huesped de prueba", extras: [], validityHours: 24, payMode: "deposit", paymentUrl: "", paymentAmountVerified: false });
function request(body, authorized = true, method = "POST") {
  return new Request("https://test.invalid/api/admin/quotes", { method,
    headers: { "Content-Type": "application/json", ...(authorized ? { "x-admin-token": "test-only-admin" } : {}) },
    ...(method === "GET" ? {} : { body: JSON.stringify(body) }) });
}
async function issue(extra = {}) {
  const body = { ...input(), ...extra };
  const prepared = await service.prepareQuote(body);
  return service.issueQuote({ ...body, expectedSnapshot: prepared.snapshot });
}
beforeEach(() => {
  rows = []; requests = []; conflicts = []; pricingChange = 0;
  process.env.SUPABASE_URL = "https://test.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-service-role";
  global.fetch = async (address, options = {}) => {
    const url = new URL(address);
    assert.equal(url.origin, "https://test.invalid", "No external network is allowed in this suite");
    assert.equal(url.pathname, "/rest/v1/admin_quotes", "Only the new quotation table may be used");
    requests.push({ method: options.method || "GET", address, options });
    const method = options.method || "GET";
    if (method === "POST") { const row = JSON.parse(options.body); rows.push(structuredClone(row)); return Response.json([structuredClone(row)]); }
    let found = rows;
    if (url.searchParams.has("share_token")) found = found.filter((r) => r.share_token === url.searchParams.get("share_token").slice(3));
    if (url.searchParams.has("id")) found = found.filter((r) => r.id === url.searchParams.get("id").slice(3));
    if (method === "PATCH") { found = found.filter((r) => !r.revoked_at); for (const row of found) Object.assign(row, JSON.parse(options.body)); }
    return Response.json(structuredClone(found));
  };
});

test("rejects impossible dates and permits leap days", () => {
  assert.equal(model.isYMD("2030-02-30"), false); assert.equal(model.isYMD("2032-02-29"), true); assert.equal(model.isYMD("2030-13-01"), false);
});
test("calendar date uses Colombia, not UTC midnight", () => {
  assert.equal(model.colombiaToday(new Date("2026-10-20T02:00:00Z")), "2026-10-19");
});
test("rejects past, reversed, same-day and more than 90 nights", () => {
  for (const change of [{ from: "2000-01-01" }, { to: "2035-03-19" }, { to: "2035-03-20" }, { to: "2035-09-20" }]) assert.throws(() => model.validateQuoteInput({ ...input(), ...change }));
});
test("rejects invalid guest counts, extras, names and validity", () => {
  for (const change of [{ guests: 2.5 }, { guests: 0 }, { guests: NaN }, { extras: ["invented"] }, { guestName: "x".repeat(61) }, { guestName: "first\nsecond" }, { validityHours: 169 }, { payMode: "other" }]) assert.throws(() => model.validateQuoteInput({ ...input(), ...change }));
});
test("rejects properties and over-capacity stays before touching storage", async () => {
  await assert.rejects(service.prepareQuote({ ...input(), guests: 17 }));
  await assert.rejects(service.prepareQuote({ ...input(), propertySlug: "unknown" }));
  assert.equal(requests.length, 0);
});
test("payment URLs enforce HTTPS, provider and hostname boundaries", () => {
  for (const url of ["javascript:alert(1)", "http://mpago.li/pay", "https://mpago.li.evil.test/x", "https://evil.test/mercadopago.com", "https://user:pass@mpago.li/x", "https://mpago.li:8080/x", "https://evil.mercadopago.com.evil.test/x"]) assert.throws(() => model.validatePaymentUrl(url));
  assert.equal(model.validatePaymentUrl("https://mpago.li/test"), "https://mpago.li/test");
  assert.equal(model.validatePaymentUrl("https://checkout.wompi.co/test"), "https://checkout.wompi.co/test");
});
test("a payment link requires administrator amount confirmation", () => {
  assert.throws(() => model.validateQuoteInput({ ...input(), paymentUrl: "https://mpago.li/test" }));
});
test("preview is side effect free and computes all extras", async () => {
  const result = await service.prepareQuote({ ...input(), guests: 16, extras: model.EXTRA_OPTIONS.map((e) => e.value) });
  assert.equal(result.snapshot.lines.length, 7);
  assert.equal(result.snapshot.totalCOP, 3020000);
  assert.equal(result.snapshot.payNowCOP, 906000);
  assert.equal(result.snapshot.balanceCOP, 2114000);
  assert.equal(requests.length, 0); assert.equal(rows.length, 0);
});
test("checkout day is excluded and full mode leaves zero balance", async () => {
  const result = await service.prepareQuote({ ...input(), payMode: "full" });
  assert.equal(result.snapshot.nights, 3); assert.equal(result.snapshot.payNowCOP, 1600000); assert.equal(result.snapshot.balanceCOP, 0);
});
test("blocked dates cannot produce a quote", async () => {
  conflicts = [{ source: "manual", start: input().from, end: input().to, summary: "Private description" }];
  await assert.rejects(service.prepareQuote(input()), (e) => e.status === 409 && !e.message.includes("Private"));
  assert.equal(rows.length, 0);
});
test("client totals are ignored and an exact reviewed snapshot is required", async () => {
  const prepared = await service.prepareQuote({ ...input(), totalCOP: 1 });
  assert.equal(prepared.snapshot.totalCOP, 1600000);
  await assert.rejects(service.issueQuote({ ...input(), expectedSnapshot: { ...prepared.snapshot, totalCOP: 1 } }), (e) => e.status === 409);
  await assert.rejects(service.issueQuote(input()), (e) => e.status === 409);
});
test("tariff changes after preview require another review", async () => {
  const prepared = await service.prepareQuote(input()); pricingChange = 100;
  await assert.rejects(service.issueQuote({ ...input(), expectedSnapshot: prepared.snapshot }), (e) => e.status === 409);
  assert.equal(rows.length, 0);
});
test("issued quotes persist one immutable snapshot, never a reservation", async () => {
  const quote = await issue();
  assert.match(quote.id, /^[0-9a-f-]{36}$/); assert.match(quote.shareToken, /^[A-Za-z0-9_-]{43}$/); assert.match(quote.number, /^ALK-\d{8}-[A-F0-9]{8}$/);
  assert.equal(rows.length, 1); assert.equal(requests.filter((r) => r.method === "POST").length, 1);
  pricingChange = 999; assert.equal((await service.viewQuote(quote.shareToken)).snapshot.totalCOP, 1600000);
});
test("share response does not expose admin credentials, provider URL or token", async () => {
  const quote = await issue({ paymentUrl: "https://mpago.li/test", paymentAmountVerified: true });
  const pub = await service.viewQuote(quote.shareToken);
  assert.equal(pub.hasPaymentLink, true); assert.equal(pub.paymentUrl, undefined); assert.equal(pub.shareToken, undefined);
  assert.ok(!JSON.stringify(pub).includes("test-only"));
  const shareUrl = new URL(model.quoteShareUrl("https://alkila.co/", quote.shareToken));
  assert.equal(shareUrl.search, ""); assert.equal(shareUrl.hash, "#" + quote.shareToken);
});
test("invalid tokens never reach the database", async () => {
  for (const token of ["short", "x".repeat(44), "x".repeat(42) + "'"]) await assert.rejects(service.viewQuote(token), (e) => e.status === 404);
  assert.equal(requests.length, 0);
});
test("unknown token returns 404", async () => {
  await assert.rejects(service.viewQuote("A".repeat(43)), (e) => e.status === 404);
});
test("expiry remains visible but disables payment", async () => {
  const quote = await issue({ paymentUrl: "https://mpago.li/test", paymentAmountVerified: true });
  rows[0].expires_at = "2000-01-01T00:00:00Z";
  assert.equal((await service.viewQuote(quote.shareToken)).status, "expired");
  await assert.rejects(service.quotePaymentUrl(quote.shareToken), (e) => e.status === 410);
});
test("revocation prevents viewing and payment, including repeated requests", async () => {
  const quote = await issue({ paymentUrl: "https://mpago.li/test", paymentAmountVerified: true });
  await store.revokeQuote(quote.id); await store.revokeQuote(quote.id);
  await assert.rejects(service.viewQuote(quote.shareToken), (e) => e.status === 410);
  await assert.rejects(service.quotePaymentUrl(quote.shareToken), (e) => e.status === 410);
});
test("payment rechecks current availability and performs no writes", async () => {
  const quote = await issue({ paymentUrl: "https://mpago.li/test", paymentAmountVerified: true });
  requests.length = 0;
  assert.equal(await service.quotePaymentUrl(quote.shareToken), "https://mpago.li/test");
  assert.ok(requests.every((r) => r.method === "GET"));
  conflicts = [{ source: "direct", start: input().from, end: input().to }];
  await assert.rejects(service.quotePaymentUrl(quote.shareToken), (e) => e.status === 409);
});
test("payment does not invent a checkout for documents without links", async () => {
  const quote = await issue(); await assert.rejects(service.quotePaymentUrl(quote.shareToken), (e) => e.status === 404);
});
test("storage is fail-closed, without ephemeral memory fallback", async () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  await assert.rejects(store.listQuotes(), (e) => e.status === 503); assert.equal(requests.length, 0);
});
test("admin API rejects reads, previews, issuance and revocation without authorization", async () => {
  for (const [handler, method, body] of [[admin.GET, "GET", null], [admin.POST, "POST", { ...input(), action: "preview" }], [admin.POST, "POST", { ...input(), action: "issue" }], [admin.PATCH, "PATCH", { action: "revoke", id: "x" }]]) {
    assert.equal((await handler(request(body, false, method))).status, 401);
  }
  assert.equal(requests.length, 0);
});
test("admin preview/issue APIs return private no-store responses", async () => {
  const preview = await admin.POST(request({ ...input(), action: "preview" }));
  assert.equal(preview.status, 200); assert.ok(preview.headers.get("cache-control").includes("no-store"));
  assert.ok(preview.headers.get("x-robots-tag").includes("noindex"));
  const data = await preview.json();
  const issued = await admin.POST(request({ ...input(), action: "issue", expectedSnapshot: data.snapshot }));
  assert.equal(issued.status, 201); assert.equal((await issued.json()).quote.snapshot.totalCOP, 1600000);
});
test("public APIs accept only a scoped token, not caller-supplied prices", async () => {
  const quote = await issue();
  const res = await view.POST(request({ token: quote.shareToken, totalCOP: 1 }, false));
  assert.equal(res.status, 200); assert.equal((await res.json()).quote.snapshot.totalCOP, 1600000);
  assert.equal((await payment.POST(request({ totalCOP: 1 }, false))).status, 404);
});
test("request body rejects invalid JSON, arrays, content types and excessive bytes", async () => {
  await assert.rejects(http.readQuoteBody(new Request("https://test.invalid", { method: "POST", headers: { "Content-Type": "text/plain" }, body: "{}" })), (e) => e.status === 415);
  await assert.rejects(http.readQuoteBody(request([])));
  await assert.rejects(http.readQuoteBody(new Request("https://test.invalid", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" })));
  await assert.rejects(http.readQuoteBody(request({ name: "x".repeat(9000) })), (e) => e.status === 413);
});
test("invalid cost breakdowns fail instead of exporting misleading totals", async () => {
  const quote = await pricing.quoteDirectStay(input()); quote.totalCOP++;
  assert.throws(() => model.quoteLines(quote), (e) => e.status === 422);
  quote.totalCOP--; quote.cleaningFeeCOP = -1;
  assert.throws(() => model.quoteLines(quote), (e) => e.status === 422);
});
test("PDF has a mobile page and guarded link with valid byte offsets", () => {
  const pdf = quotationPdf(new Uint8Array([255, 216, 255, 217]), 1080, 1920, "https://alkila.co/cotizacion#" + "A".repeat(43));
  const text = Buffer.from(pdf).toString("latin1");
  assert.ok(text.startsWith("%PDF-1.4")); assert.ok(text.includes("/MediaBox [0 0 360 640]")); assert.ok(text.includes("/Subtype /Link"));
  const xrefOffset = Number(text.match(/startxref\n(\d+)/)[1]); assert.equal(text.slice(xrefOffset, xrefOffset + 4), "xref");
  const offsets = text.slice(xrefOffset).split("\n").slice(3, 9).map((line) => Number(line.slice(0, 10)));
  offsets.forEach((offset, index) => assert.ok(text.slice(offset).startsWith(`${index + 1} 0 obj`)));
});
