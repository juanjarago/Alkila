export type ColombiaSeasonKind =
  | "holiday_weekend"
  | "holy_week"
  | "school_break"
  | "christmas"
  | "new_year";

export type ColombiaSeasonMatch = {
  kind: ColombiaSeasonKind;
  label: string;
};

export type ColombiaSeasonWindow = {
  kind: ColombiaSeasonKind;
  label: string;
  from: string;
  to: string;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toYMD(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateFromYMD(year: number, month: number, day: number) {
  return new Date(year, month - 1, day);
}

function nextMonday(date: Date) {
  const day = date.getDay();
  if (day === 1) return date;
  return addDays(date, (8 - day) % 7);
}

function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return dateFromYMD(year, month, day);
}

function dateSet(dates: Date[]) {
  return new Set(dates.map(toYMD));
}

export function colombiaHolidays(year: number) {
  const easter = easterSunday(year);
  const fixed = [
    dateFromYMD(year, 1, 1),
    dateFromYMD(year, 5, 1),
    dateFromYMD(year, 7, 20),
    dateFromYMD(year, 8, 7),
    dateFromYMD(year, 12, 8),
    dateFromYMD(year, 12, 25),
    addDays(easter, -3),
    addDays(easter, -2),
  ];

  const emiliani = [
    dateFromYMD(year, 1, 6),
    dateFromYMD(year, 3, 19),
    dateFromYMD(year, 6, 29),
    dateFromYMD(year, 8, 15),
    dateFromYMD(year, 10, 12),
    dateFromYMD(year, 11, 1),
    dateFromYMD(year, 11, 11),
    addDays(easter, 39),
    addDays(easter, 60),
    addDays(easter, 68),
  ].map(nextMonday);

  return [...fixed, ...emiliani];
}

function isWithin(ymd: string, from: Date, to: Date) {
  return ymd >= toYMD(from) && ymd <= toYMD(to);
}

function isHolidayWeekendNight(ymd: string) {
  const date = new Date(`${ymd}T00:00:00`);
  const holidays = dateSet([
    ...colombiaHolidays(date.getFullYear() - 1),
    ...colombiaHolidays(date.getFullYear()),
    ...colombiaHolidays(date.getFullYear() + 1),
  ]);

  if (holidays.has(ymd)) return true;

  const day = date.getDay();
  const daysUntilMonday = (8 - day) % 7;
  const nextMon = addDays(date, daysUntilMonday);
  return (day === 5 || day === 6 || day === 0) && holidays.has(toYMD(nextMon));
}

export function colombiaSeasonMatches(ymd: string): ColombiaSeasonMatch[] {
  const date = new Date(`${ymd}T00:00:00`);
  const year = date.getFullYear();
  const matches: ColombiaSeasonMatch[] = [];
  const easter = easterSunday(year);
  const recesoHoliday = nextMonday(dateFromYMD(year, 10, 12));

  if (isHolidayWeekendNight(ymd)) {
    matches.push({ kind: "holiday_weekend", label: "Fin de semana con festivo" });
  }

  if (isWithin(ymd, addDays(easter, -7), easter)) {
    matches.push({ kind: "holy_week", label: "Semana Santa" });
  }

  if (isWithin(ymd, addDays(recesoHoliday, -7), addDays(recesoHoliday, -1))) {
    matches.push({ kind: "school_break", label: "Semana de receso" });
  }

  if (isWithin(ymd, dateFromYMD(year, 12, 20), dateFromYMD(year, 12, 27))) {
    matches.push({ kind: "christmas", label: "Navidad" });
  }

  if (
    isWithin(ymd, dateFromYMD(year, 12, 28), dateFromYMD(year, 12, 31)) ||
    isWithin(ymd, dateFromYMD(year, 1, 1), dateFromYMD(year, 1, 5))
  ) {
    matches.push({ kind: "new_year", label: "Ano nuevo" });
  }

  return matches;
}

export function colombiaSeasonWindows(year: number): ColombiaSeasonWindow[] {
  const easter = easterSunday(year);
  const recesoHoliday = nextMonday(dateFromYMD(year, 10, 12));

  return [
    {
      kind: "holy_week",
      label: "Semana Santa",
      from: toYMD(addDays(easter, -7)),
      to: toYMD(easter),
    },
    {
      kind: "school_break",
      label: "Semana de receso",
      from: toYMD(addDays(recesoHoliday, -7)),
      to: toYMD(addDays(recesoHoliday, -1)),
    },
    {
      kind: "christmas",
      label: "Navidad",
      from: toYMD(dateFromYMD(year, 12, 20)),
      to: toYMD(dateFromYMD(year, 12, 27)),
    },
    {
      kind: "new_year",
      label: "Ano nuevo",
      from: toYMD(dateFromYMD(year, 12, 28)),
      to: toYMD(dateFromYMD(year + 1, 1, 5)),
    },
  ];
}
