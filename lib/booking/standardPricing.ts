import { colombiaHolidays, colombiaSeasonMatches } from "./colombiaCalendar";

// Approved platform tariffs. Direct accommodation and extra guests cost 90%.
export const STANDARD_FROM = "2026-10-28";
export const STANDARD_TO = "2027-04-28"; // Last priced night, inclusive.
export const STANDARD_HOUSES: Record<string, { night: number; included: number; extra: number }> = {
  "casa-campestre-anapoima-16-personas": { night: 800000, included: 6, extra: 80000 },
  "finca-anapoima-22-personas": { night: 1300000, included: 10, extra: 100000 },
};

export function standardizedStay(propertySlug: string, nights: string[], guests: number) {
  const house = STANDARD_HOUSES[propertySlug];
  if (!house) return undefined;
  const applies = (night: string) => night >= STANDARD_FROM && night <= STANDARD_TO;
  if (!nights.some(applies)) return undefined;
  const yearEnd = nights.some((night) => night >= "2026-12-20" && night <= "2027-01-06");
  const holidays = new Set([2026, 2027].flatMap(colombiaHolidays).map((d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  ));
  return nights.map((night) => {
    if (!applies(night) && !yearEnd) return undefined;
    const day = new Date(`${night}T12:00:00Z`).getUTCDay();
    const monday = new Date(`${night}T12:00:00Z`);
    monday.setUTCDate(monday.getUTCDate() + (8 - day) % 7);
    const bridge = (day === 5 || day === 6 || day === 0) && holidays.has(monday.toISOString().slice(0, 10));
    const seasons = colombiaSeasonMatches(night);
    const holyWeekOrBreak = seasons.some((s) => s.kind === "holy_week" || s.kind === "school_break");
    const specialHoliday = night === "2026-12-08";
    const multiplier = yearEnd ? 2 : holyWeekOrBreak ? 1.5 : bridge || specialHoliday ? 1.2 : day === 5 || day === 6 ? 1 : 0.7;
    const minNights = yearEnd ? 5 : holyWeekOrBreak ? 4 : bridge || specialHoliday ? 3 : day === 5 || day === 6 ? 2 : 1;
    return {
      nightCOP: Math.round(house.night * multiplier * 0.9),
      // Seasonal treatment of extra guests is still unresolved on platforms.
      // Keep the agreed fixed extra, with the direct-channel 10% discount.
      extraGuestFeeCOP: Math.round(Math.max(0, guests - house.included) * house.extra * 0.9),
      minNights,
    };
  });
}
