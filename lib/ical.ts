export type IcalBlockedEvent = {
  uid?: string;
  summary?: string;
  start: string;
  end: string;
};

function unfoldIcalLines(input: string): string[] {
  const rawLines = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const lines: string[] = [];

  for (const line of rawLines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }

  return lines;
}

function valueFromLine(line: string): string | null {
  const idx = line.indexOf(":");
  if (idx === -1) return null;
  return line.slice(idx + 1).trim();
}

function normalizeIcalDate(value: string | null): string | null {
  if (!value) return null;

  const compact = value.trim();
  if (/^\d{8}$/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  }

  const datePart = compact.slice(0, 8);
  if (/^\d{8}$/.test(datePart)) {
    return `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
  }

  const parsed = new Date(compact);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);

  return null;
}

export function parseIcalBlockedEvents(ics: string): IcalBlockedEvent[] {
  const lines = unfoldIcalLines(ics);
  const events: IcalBlockedEvent[] = [];
  let current: Partial<IcalBlockedEvent> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (current?.start && current?.end) {
        events.push(current as IcalBlockedEvent);
      }
      current = null;
      continue;
    }

    if (!current) continue;

    if (line.startsWith("UID")) current.uid = valueFromLine(line) ?? undefined;
    if (line.startsWith("SUMMARY")) current.summary = valueFromLine(line) ?? undefined;
    if (line.startsWith("DTSTART")) current.start = normalizeIcalDate(valueFromLine(line)) ?? "";
    if (line.startsWith("DTEND")) current.end = normalizeIcalDate(valueFromLine(line)) ?? "";
  }

  return events;
}

export function dateRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  return startA < endB && startB < endA;
}

export function blockedEventsForRange(
  events: IcalBlockedEvent[],
  from: string,
  to: string
) {
  return events.filter((event) => dateRangesOverlap(from, to, event.start, event.end));
}

export async function fetchIcalBlockedEvents(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "text/calendar, text/plain, */*" },
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`iCal error (${res.status}): ${text.slice(0, 160)}`);
  }

  return parseIcalBlockedEvents(text);
}
