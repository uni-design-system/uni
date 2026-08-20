/**
 * Pure date/time helpers: ISO string math, `Intl`-driven formatting and
 * parsing. No date library — `Date` appears only as UTC arithmetic inside
 * these functions, so no result ever depends on the machine's timezone.
 */
import { memoize } from '../helpers/memoize.helper';
import type { UniDate, UniDateTime, UniTime } from './datetime.model';

const pad = (n: number): string => String(n).padStart(2, '0');

const toUTC = (date: UniDate): number => {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

const fromUTC = (timestamp: number): UniDate => {
  const d = new Date(timestamp);
  return isoDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
};

/** `(2026, 8, 5)` → `'2026-08-05'`. Does not validate — see `isValidDate`. */
export const isoDate = (year: number, month: number, day: number): UniDate =>
  `${year}-${pad(month)}-${pad(day)}`;

/** The ISO date when the parts form a real calendar day, else `null`. */
export const isValidDate = (year: number, month: number, day: number): UniDate | null =>
  month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)
    ? isoDate(year, month, day)
    : null;

/** Days in a month, leap-year aware. */
export const daysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

export const addDays = (date: UniDate, days: number): UniDate =>
  fromUTC(toUTC(date) + days * 86_400_000);

/** Same day ± n months, clamping the day to the target month's length. */
export const addMonths = (date: UniDate, months: number): UniDate => {
  let [y, m] = date.split('-').map(Number);
  const d = Number(date.slice(8, 10));
  const total = y * 12 + (m - 1) + months;
  y = Math.floor(total / 12);
  m = ((total % 12) + 12) % 12 + 1;
  return isoDate(y, m, Math.min(d, daysInMonth(y, m)));
};

/** Day of week, 0 = Sunday … 6 = Saturday. */
export const dayOfWeek = (date: UniDate): number => new Date(toUTC(date)).getUTCDay();

/** `'2026-08-20'` → `'2026-08'`. */
export const monthOf = (date: UniDate): string => date.slice(0, 7);

/** Today as a local-wall-clock ISO date (the one place local time matters). */
export const todayIso = (): UniDate => {
  const d = new Date();
  return isoDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
};

/** Inclusive day count of a range: `('-20', '-24')` → 5. */
export const inclusiveDayCount = (start: UniDate, end: UniDate): number =>
  Math.round((toUTC(end) - toUTC(start)) / 86_400_000) + 1;

export interface UniMonthGridCell {
  date: UniDate;
  /** True for leading/trailing cells that belong to the adjacent months. */
  outside: boolean;
}

/**
 * The week matrix a calendar renders: full weeks covering `'YYYY-MM'`,
 * starting on `weekStart` (0 = Sunday). Outside cells are always present so
 * showing or hiding them is a pure render decision.
 */
export const buildMonthGrid = (month: string, weekStart: number): UniMonthGridCell[][] => {
  const [y, m] = month.split('-').map(Number);
  const first = isoDate(y, m, 1);
  const offset = (dayOfWeek(first) - weekStart + 7) % 7;
  const total = daysInMonth(y, m);
  const weeks: UniMonthGridCell[][] = [];
  let cursor = addDays(first, -offset);
  for (let w = 0; w < Math.ceil((offset + total) / 7); w++) {
    const week: UniMonthGridCell[] = [];
    for (let c = 0; c < 7; c++) {
      week.push({ date: cursor, outside: monthOf(cursor) !== month });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
};

// ---- Intl formatting (always UTC — the ISO string is re-hydrated as UTC
// midnight, so the local zone can never shift the label) ---------------------

export const formatDate = (
  date: UniDate,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string =>
  new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(new Date(toUTC(date)));

/** `'2026-08'` → `'August 2026'` in the locale. */
export const formatMonthHeading = (month: string, locale: string): string =>
  formatDate(`${month}-01`, locale, { month: 'long', year: 'numeric' });

export interface UniWeekdayName {
  /** Column label in the requested format ('narrow' | 'short'). */
  label: string;
  /** Full weekday name, for the columnheader's `abbr`. */
  full: string;
}

/** Weekday header labels starting at `weekStart` (0 = Sunday). */
export const weekdayNames = memoize(
  (locale: string, weekStart: number, format: 'narrow' | 'short'): UniWeekdayName[] => {
    const labels: UniWeekdayName[] = [];
    for (let i = 0; i < 7; i++) {
      // 2023-01-01 is a Sunday.
      const day = new Date(Date.UTC(2023, 0, 1 + ((weekStart + i) % 7)));
      labels.push({
        label: new Intl.DateTimeFormat(locale, { weekday: format, timeZone: 'UTC' }).format(day),
        full: new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(day),
      });
    }
    return labels;
  }
);

/** `'15:00'` → `'3:00 PM'` (or `'15:00'` when `hour12` is false). */
export const formatTime = (time: UniTime, locale: string, hour12: boolean): string => {
  const [h, m] = time.split(':').map(Number);
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
};

// ---- Locale plumbing --------------------------------------------------------

interface WeekInfo {
  firstDay?: number;
}

/**
 * The locale's first day of week, 0 = Sunday … 6 = Saturday. Falls back to
 * Sunday where `Intl.Locale` week info is unavailable.
 */
export const localeWeekStart = memoize((locale: string): number => {
  try {
    const intlLocale = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => WeekInfo;
      weekInfo?: WeekInfo;
    };
    const info = intlLocale.getWeekInfo?.() ?? intlLocale.weekInfo;
    // Intl counts 1 = Monday … 7 = Sunday.
    if (info?.firstDay) return info.firstDay % 7;
  } catch {
    // Unknown locale tag — fall through to the default.
  }
  return 0;
});

/** Whether the locale's default clock is 12-hour. */
export const localeDefaultHour12 = memoize(
  (locale: string): boolean =>
    new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hour12 ?? true
);

type DateField = 'year' | 'month' | 'day';

/** The locale's numeric-date field order, e.g. en-US → month, day, year. */
export const localeFieldOrder = memoize((locale: string): DateField[] => {
  const parts = new Intl.DateTimeFormat(locale, { timeZone: 'UTC' }).formatToParts(
    new Date(Date.UTC(2000, 11, 31))
  );
  return parts
    .filter((p): p is Intl.DateTimeFormatPart & { type: DateField } =>
      ['year', 'month', 'day'].includes(p.type)
    )
    .map((p) => p.type);
});

/** Long + short month names → month number, lowercased, dots stripped. */
export const localeMonthNames = memoize((locale: string): Map<string, number> => {
  const map = new Map<string, number>();
  for (let i = 0; i < 12; i++) {
    const date = new Date(Date.UTC(2000, i, 15));
    for (const style of ['long', 'short'] as const) {
      const name = new Intl.DateTimeFormat(locale, { month: style, timeZone: 'UTC' })
        .format(date)
        .toLowerCase()
        .replace(/\./g, '');
      map.set(name, i + 1);
    }
  }
  return map;
});

/** The locale's digit pattern as a placeholder, e.g. `'MM/DD/YYYY'`. */
export const localeDatePlaceholder = memoize((locale: string): string =>
  new Intl.DateTimeFormat(locale, { timeZone: 'UTC' })
    .format(new Date(Date.UTC(2000, 11, 31)))
    .replace(/2000/, 'YYYY')
    .replace(/12/, 'MM')
    .replace(/31/, 'DD')
);

// ---- Parsing (Intl-driven — digit order and month names come from the
// locale, never from a hardcoded table) ---------------------------------------

/** Missing year → the NEXT occurrence: nobody schedules into the past. */
const nextOccurrence = (month: number, day: number, today: UniDate): UniDate | null => {
  const year = Number(today.slice(0, 4));
  const candidate = isValidDate(year, month, day);
  if (candidate && candidate >= today) return candidate;
  return isValidDate(year + 1, month, day);
};

/**
 * Free-typed date text → ISO date, or `null` when unreadable. Accepts, in
 * order: ISO (`2026-08-20`), a month name from the locale's own long/short
 * lists (`aug 20`, `20 aug 2026`, `August 20th`), and locale-numeric text
 * (`8/20/2026`, `20.8.2026`, `08-20`) with the digit order taken from
 * `Intl.DateTimeFormat(locale).formatToParts()`. A missing year resolves to
 * the next occurrence; two-digit years are refused rather than guessed.
 */
export const parseDateText = (
  raw: string,
  locale: string,
  options: { today?: UniDate } = {}
): UniDate | null => {
  const today = options.today ?? todayIso();
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/(\d+)(st|nd|rd|th)\b/g, '$1')
    .replace(/,/g, ' ');
  if (!s) return null;

  // 1. ISO — what agents and APIs write.
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return isValidDate(+iso[1], +iso[2], +iso[3]);

  // 2. Month name, from the locale's own list.
  const monthNames = localeMonthNames(locale);
  const tokens = s.split(/\s+/);
  const monthToken = tokens.find((t) => monthNames.has(t.replace(/\./g, '')));
  if (monthToken) {
    const month = monthNames.get(monthToken.replace(/\./g, ''))!;
    const numbers = tokens.filter((t) => /^\d+$/.test(t)).map(Number);
    if (numbers.length === 1 && numbers[0] >= 1 && numbers[0] <= 31)
      return nextOccurrence(month, numbers[0], today);
    if (numbers.length === 2) {
      const year = numbers.find((n) => n >= 1000);
      const day = numbers.find((n) => n <= 31 && n !== year);
      if (year && day) return isValidDate(year, month, day);
    }
    return null;
  }

  // 3. Locale numeric — digit order from Intl, not hardcoded.
  const numeric = s.match(/^(\d{1,4})[/.\-\s](\d{1,4})(?:[/.\-\s](\d{1,4}))?$/);
  if (!numeric) return null;
  const parts = [numeric[1], numeric[2], numeric[3]].filter((p): p is string => !!p);
  if (parts.length === 3) {
    if (parts[0].length === 4) return isValidDate(+parts[0], +parts[1], +parts[2]); // 2026/8/20
    const bag: Partial<Record<DateField, string>> = {};
    localeFieldOrder(locale).forEach((field, i) => (bag[field] = parts[i]));
    if (!bag.year || bag.year.length < 4) return null; // two-digit years are refused, not guessed
    return isValidDate(+bag.year, +bag.month!, +bag.day!);
  }
  // Two numbers: month/day in locale order, year = next occurrence.
  const bag: Partial<Record<DateField, number>> = {};
  localeFieldOrder(locale)
    .filter((field) => field !== 'year')
    .forEach((field, i) => (bag[field] = +parts[i]));
  return bag.month && bag.day ? nextOccurrence(bag.month, bag.day, today) : null;
};

/**
 * Free-typed time text → `'HH:mm'`, or `null`. Accepts `9`, `930`, `9:30`,
 * `9.30`, `9 30`, `3p`, `3pm`, `3 PM`, `15:00`. Bare hours 1–7 with no
 * meridiem lean PM when `hour12` — typing `3` into an appointment field
 * means 15:00, not 03:00.
 */
export const parseTimeText = (raw: string, hour12: boolean): UniTime | null => {
  const s = raw.trim().toLowerCase().replace(/\s+/g, '');
  const match = s.match(/^(\d{1,2})(?:[:.h]?(\d{2}))?(a|am|p|pm)?$/);
  if (!match) return null;
  let hour = +match[1];
  const minute = match[2] ? +match[2] : 0;
  const meridiem = match[3];
  if (minute > 59) return null;
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem[0] === 'p' && hour !== 12) hour += 12;
    if (meridiem[0] === 'a' && hour === 12) hour = 0;
  } else {
    if (hour > 23) return null;
    if (hour12 && hour >= 1 && hour <= 7) hour += 12;
  }
  return `${pad(hour)}:${pad(minute)}`;
};

/** Every `minuteStep` time between `min` and `max` (inclusive bounds). */
export const timeSlots = (minuteStep: number, min?: UniTime, max?: UniTime): UniTime[] => {
  const slots: UniTime[] = [];
  const lo = min ?? '00:00';
  const hi = max ?? '23:59';
  for (let minutes = 0; minutes < 24 * 60; minutes += minuteStep) {
    const t = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
    if (t >= lo && t <= hi) slots.push(t);
  }
  return slots;
};

// ---- Combined values --------------------------------------------------------

export const splitDateTime = (value?: UniDateTime): { date?: UniDate; time?: UniTime } => {
  if (!value) return {};
  const [date, time] = value.split('T');
  return { ...(date ? { date } : {}), ...(time ? { time } : {}) };
};

/** One combined value only when both parts are present. */
export const joinDateTime = (date?: UniDate, time?: UniTime): UniDateTime | undefined =>
  date && time ? `${date}T${time}` : undefined;
