const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const oldLoad = Module._load;
Module._load = function(request, parent, isMain) {
  return oldLoad.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, parent, isMain);
};
Module._extensions[".ts"] = function(module, filename) {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
  }).outputText, filename);
};
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.AIRBNB_ICAL_CASA_DAVID_URL;
delete process.env.BOOKING_ICAL_CASA_DAVID_URL;
delete process.env.CASA_DAVID_AIRBNB_IMPORT_CONFIRMED;
global.fetch = async () => { throw new Error("No production network allowed"); };
const slug = "casa-david-apulo-13-personas";
const { properties } = require("../lib/properties.ts");
const property = properties.find(p => p.slug === slug);
const { quoteDirectStay } = require("../lib/booking/pricing.ts");
const { collectAvailabilityConflicts } = require("../lib/booking/availability.ts");
const { isPropertyCalendarReady } = require("../lib/booking/calendarSetup.ts");
const { createManualBlock } = require("../lib/booking/store.ts");
const { fetchIcalBlockedEvents } = require("../lib/ical.ts");
const quote = (from, to, guests = 6, extras = []) => quoteDirectStay({ propertySlug: slug, from, to, guests, extras });
const setup = () => {
  process.env.AIRBNB_ICAL_CASA_DAVID_URL = "https://calendar.example/david.ics";
  process.env.CASA_DAVID_AIRBNB_IMPORT_CONFIRMED = "true";
};
const reset = () => {
  delete process.env.AIRBNB_ICAL_CASA_DAVID_URL;
  delete process.env.CASA_DAVID_AIRBNB_IMPORT_CONFIRMED;
  global.fetch = async () => { throw new Error("No production network allowed"); };
};

test("David has its own real photo gallery, Apulo location and no invented STAYS link", () => {
  assert.equal(property.capacity, 13); assert.equal(property.rooms, 4); assert.equal(property.baths, 4.5);
  assert.match(property.locationLabel, /Apulo/); assert.equal(property.privateJacuzzi, false);
  assert.equal(property.staysListingId, undefined);
  assert.ok(property.images.length >= 8);
  for (const image of property.images) assert.ok(fs.existsSync(path.join(root, "public", image)));
});
test("six included guests, fixed discounted extras, cleaning and pets", async () => {
  const six = await quote("2026-11-16", "2026-11-17");
  assert.equal(six.subtotalCOP, 317635); assert.equal(six.extraGuestFeeCOP, 0); assert.equal(six.totalCOP, 417635);
  const seven = await quote("2026-11-16", "2026-11-17", 7, ["pets"]);
  assert.equal(seven.extraGuestFeeCOP, 90000); assert.equal(seven.petFeeCOP, 50000); assert.equal(seven.totalCOP, 557635);
  const thirteen = await quote("2026-11-20", "2026-11-22", 13);
  assert.equal(thirteen.subtotalCOP, 453764 * 2); assert.equal(thirteen.extraGuestFeeCOP, 7 * 90000 * 2);
  await assert.rejects(quote("2026-11-20", "2026-11-22", 14), /13 personas/);
  await assert.rejects(quote("2026-11-16", "2026-11-17", 6, ["domestic_service"]), /consulta previa/);
});
test("bridge and holiday Monday use agreed prices without stacking", async () => {
  const q = await quote("2026-11-13", "2026-11-17");
  assert.equal(q.subtotalCOP, 544517 * 3 + 317635); assert.equal(q.minNights, 3);
  await assert.rejects(quote("2026-11-20", "2026-11-21"), /2 noches/);
  await assert.rejects(quote("2026-11-13", "2026-11-15"), /3 noches/);
  const dec = await quote("2026-12-07", "2026-12-10");
  assert.equal(dec.subtotalCOP, 317635 * 2 + 544517);
});
test("Holy Week and year-end crossing use approved minima and direct prices", async () => {
  assert.equal((await quote("2027-03-21", "2027-03-25")).subtotalCOP, 680646 * 4);
  await assert.rejects(quote("2027-03-21", "2027-03-24"), /4 noches/);
  const end = await quote("2026-12-18", "2026-12-23", 7);
  assert.equal(end.subtotalCOP, 907528 * 5); assert.equal(end.extraGuestFeeCOP, 90000 * 5);
  assert.equal(end.minNights, 5);
  await assert.rejects(quote("2026-12-20", "2026-12-24"), /5 noches/);
});
test("unapproved dates cannot silently fall back to legacy rates", async () => {
  assert.equal((await quote("2027-04-28", "2027-04-29")).subtotalCOP, 317635);
  await assert.rejects(quote("2027-04-28", "2027-04-30"), /consulta la tarifa/);
  await assert.rejects(quote("2026-11-12", "2026-11-17"), /consulta la tarifa/);
});
test("both directions must be configured before a direct booking or payment", async () => {
  reset(); assert.equal(isPropertyCalendarReady(property), false);
  await assert.rejects(collectAvailabilityConflicts({ propertySlug: slug, from: "2026-11-20", to: "2026-11-22" }), /WhatsApp/);
  process.env.AIRBNB_ICAL_CASA_DAVID_URL = "https://calendar.example/david.ics";
  assert.equal(isPropertyCalendarReady(property), false);
  const payment = require("../app/api/mp/create-preference/route.ts");
  const response = await payment.POST(new Request("http://localhost/api/mp/create-preference", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, checkIn: "2026-11-20", checkOut: "2026-11-22", guests: 6 }) }));
  assert.notEqual(response.status, 200); assert.match((await response.json()).error, /WhatsApp/);
  reset();
});
test("Airbnb imports block occupied nights, permit checkout, and feed errors fail closed", async () => {
  setup();
  global.fetch = async () => new Response("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:airbnb-test\r\nDTSTART;VALUE=DATE:20261120\r\nDTEND;VALUE=DATE:20261122\r\nSUMMARY:Reserved\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n");
  assert.equal((await collectAvailabilityConflicts({ propertySlug: slug, from: "2026-11-20", to: "2026-11-22" })).length, 1);
  assert.equal((await collectAvailabilityConflicts({ propertySlug: slug, from: "2026-11-22", to: "2026-11-23" })).length, 0);
  global.fetch = async () => new Response("<html>Login</html>");
  await assert.rejects(fetchIcalBlockedEvents("https://calendar.example/david.ics"), /calendario externo/);
  await assert.rejects(collectAvailabilityConflicts({ propertySlug: slug, from: "2026-11-20", to: "2026-11-22" }), /calendario externo/);
  reset();
});
test("export contains local blocks, not imported Airbnb events", async () => {
  await createManualBlock({ id: "david-block", propertySlug: slug, from: "2026-11-24", to: "2026-11-26", reason: "Mantenimiento" });
  const calendar = require("../app/api/calendar/[slug]/route.ts");
  const response = await calendar.GET(new Request("http://localhost/api/calendar/" + slug), { params: Promise.resolve({ slug }) });
  const text = await response.text();
  assert.equal(response.status, 200); assert.match(text, /DTSTART;VALUE=DATE:20261124/);
  assert.match(text, /DTEND;VALUE=DATE:20261126/); assert.doesNotMatch(text, /airbnb-test|guestEmail|guestName/);
});
