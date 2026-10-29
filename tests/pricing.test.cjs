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
global.fetch = async () => { throw new Error("No production network allowed"); };
const { quoteDirectStay, enumerateNights } = require("../lib/booking/pricing.ts");
const store = require("../lib/booking/store.ts");
const grande = "finca-anapoima-22-personas";
const mediana = "casa-campestre-anapoima-16-personas";
const quote = (from, to, guests = 10, propertySlug = grande, extras = []) => quoteDirectStay({ propertySlug, from, to, guests, extras });

test("ordinary Sunday to Thursday permits one night, including holiday Monday checkout", async () => {
  for (const from of ["2026-10-28", "2026-11-02", "2026-11-16", "2027-01-07", "2027-04-28"]) {
    const to = new Date(`${from}T12:00:00Z`); to.setUTCDate(to.getUTCDate() + 1);
    for (const [slug, guests, price] of [[grande, 10, 819000], [mediana, 6, 504000]]) {
      const q = await quote(from, to.toISOString().slice(0, 10), guests, slug);
      assert.equal(q.minNights, 1); assert.equal(q.subtotalCOP, price);
    }
  }
});

test("every authorized night matches the explicit agreed calendar for both houses", () => {
  const { standardizedStay } = require("../lib/booking/standardPricing.ts");
  const specials = [
    ["2026-10-30", "2026-11-01", 1.2, 3], ["2026-11-13", "2026-11-15", 1.2, 3],
    ["2026-12-08", "2026-12-08", 1.2, 3], ["2027-01-08", "2027-01-10", 1.2, 3],
    ["2027-03-19", "2027-03-20", 1.2, 3], ["2027-03-21", "2027-03-28", 1.5, 4],
    ["2026-12-20", "2027-01-06", 2, 5],
  ];
  for (const night of enumerateNights("2026-10-28", "2027-04-29")) {
    const special = specials.find(([from, to]) => night >= from && night <= to);
    const weekend = [5, 6].includes(new Date(night + "T12:00:00Z").getUTCDay());
    for (const [slug, guests, base] of [[grande, 10, 1300000], [mediana, 6, 800000]]) {
      const [q] = standardizedStay(slug, [night], guests);
      assert.equal(q.nightCOP, Math.round(base * (special?.[2] ?? (weekend ? 1 : 0.7)) * 0.9), night);
      assert.equal(q.minNights, special?.[3] ?? (weekend ? 2 : 1), night);
    }
  }
});

test("weekday and ordinary weekend use 90% of standard, without stacking", async () => {
  assert.equal((await quote("2026-11-03", "2026-11-05")).subtotalCOP, 819000 * 2);
  assert.equal((await quote("2026-11-06", "2026-11-08")).subtotalCOP, 1170000 * 2);
  assert.equal((await quote("2026-11-06", "2026-11-09")).subtotalCOP, 1170000 * 2 + 819000);
});
test("holiday bridge is Fri/Sat/Sun; Monday night returns to weekday", async () => {
  const q = await quote("2026-11-13", "2026-11-17");
  assert.equal(q.subtotalCOP, 1404000 * 3 + 819000);
  assert.equal(q.minNights, 3);
  await assert.rejects(quote("2026-11-13", "2026-11-15"), /3 noches/);
  assert.equal((await quote("2026-11-16", "2026-11-18")).subtotalCOP, 819000 * 2);
});
test("December 8 premium and three-night minimum", async () => {
  assert.equal((await quote("2026-12-07", "2026-12-10")).subtotalCOP, 819000 * 2 + 1404000);
  await assert.rejects(quote("2026-12-07", "2026-12-09"), /3 noches/);
});
test("year-end applies to entire crossing stay, including January 6 night", async () => {
  for (const [from, to, nights] of [["2026-12-18", "2026-12-23", 5], ["2027-01-03", "2027-01-09", 6], ["2027-01-06", "2027-01-11", 5]]) {
    const q = await quote(from, to);
    assert.equal(q.subtotalCOP, 2340000 * nights);
    assert.equal(q.minNights, 5);
  }
  await assert.rejects(quote("2026-12-20", "2026-12-24"), /5 noches/);
  assert.equal((await quote("2026-12-15", "2026-12-20")).subtotalCOP, 819000 * 3 + 1170000 * 2);
  assert.equal((await quote("2027-01-07", "2027-01-10")).subtotalCOP, 819000 + 1404000 * 2);
});
test("Holy Week uses base plus 50% and four nights, overriding bridge", async () => {
  const q = await quote("2027-03-22", "2027-03-26");
  assert.equal(q.subtotalCOP, 1755000 * 4);
  assert.equal(q.minNights, 4);
  await assert.rejects(quote("2027-03-25", "2027-03-28"), /4 noches/);
});
test("both houses charge correct included guests and fixed discounted extras", async () => {
  const q = await quote("2026-11-06", "2026-11-08", 16, mediana);
  assert.equal(q.subtotalCOP, 720000 * 2);
  assert.equal(q.extraGuestFeeCOP, 10 * 72000 * 2);
  assert.equal(q.totalCOP, q.subtotalCOP + q.extraGuestFeeCOP + q.cleaningFeeCOP);
  assert.equal((await quote("2026-12-20", "2026-12-25", 24)).extraGuestFeeCOP, 14 * 90000 * 5);
  await assert.rejects(quote("2026-11-06", "2026-11-08", 25), /24 personas/);
  await assert.rejects(quote("2026-11-06", "2026-11-08", 17, mediana), /16 personas/);
});
test("invalid dates, reversed dates and fractional guests fail", async () => {
  for (const [a, b] of [["2027-02-30", "2027-03-03"], ["bad", "2027-01-03"], ["2027-02-02", "2027-02-01"]]) assert.throws(() => enumerateNights(a, b));
  await assert.rejects(quote("2026-11-06", "2026-11-08", 10.5));
});
test("existing configured seasonal tariffs cannot override approved window", async () => {
  await store.createSeasonalRate({ id: "test", propertySlug: mediana, name: "old", from: "2026-11-01", to: "2026-12-01", nightCOP: 1, minNights: 9 });
  assert.equal((await quote("2026-11-06", "2026-11-08", 6, mediana)).subtotalCOP, 1440000);
});
test("fees and availability conflicts remain intact", async () => {
  const q = await quote("2026-11-06", "2026-11-08", 10, grande, ["pets", "domestic_service", "early_checkin", "late_checkout"]);
  assert.equal(q.cleaningFeeCOP, 220000);
  assert.equal(q.extrasFeeCOP, 50000 + 90000 * 2 + 585000 * 2);
  const conflict = { source: "manual", start: "2026-11-06", end: "2026-11-08" };
  assert.equal((await quoteDirectStay({ propertySlug: grande, from: "2026-11-06", to: "2026-11-08", guests: 10, conflicts: [conflict] })).blocked, true);
});
test("scope boundaries and cabaña retain legacy pricing outside agreement", async () => {
  assert.equal((await quote("2027-04-27", "2027-04-29")).subtotalCOP, 819000 * 2);
  assert.equal((await quote("2027-04-28", "2027-04-30")).subtotalCOP, 819000 + 2400000);
  const q = await quote("2026-11-03", "2026-11-05", 6, "cabana-privada-anapoima-8-personas");
  assert.equal(q.subtotalCOP, 1900000);
});
