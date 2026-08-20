/**
 * The pure layer under all four date/time components. Parsing and grid math
 * are the highest-value test surface — every keyboard behaviour above them
 * assumes these are exact.
 */
import {
  addDays,
  addMonths,
  buildMonthGrid,
  dayOfWeek,
  daysInMonth,
  formatDate,
  formatMonthHeading,
  formatTime,
  inclusiveDayCount,
  isValidDate,
  isoDate,
  joinDateTime,
  localeDatePlaceholder,
  localeFieldOrder,
  localeMonthNames,
  localeWeekStart,
  monthOf,
  parseDateText,
  parseTimeText,
  splitDateTime,
  timeSlots,
  weekdayNames,
} from './datetime.helper';

describe('datetime helpers', () => {
  describe('ISO math', () => {
    it('builds and validates dates', () => {
      expect(isoDate(2026, 8, 5)).toBe('2026-08-05');
      expect(isValidDate(2026, 8, 20)).toBe('2026-08-20');
      expect(isValidDate(2026, 8, 32)).toBeNull();
      expect(isValidDate(2026, 13, 1)).toBeNull();
      expect(isValidDate(2026, 2, 29)).toBeNull(); // not a leap year
      expect(isValidDate(2028, 2, 29)).toBe('2028-02-29');
    });

    it('addDays crosses month and year edges', () => {
      expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
      expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
      expect(addDays('2026-08-20', 0)).toBe('2026-08-20');
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29'); // leap day
    });

    it('addMonths clamps the day to the target month length', () => {
      expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
      expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
      expect(addMonths('2026-08-20', -12)).toBe('2025-08-20');
      expect(addMonths('2026-12-15', 1)).toBe('2027-01-15');
      expect(addMonths('2026-01-15', -1)).toBe('2025-12-15');
    });

    it('knows weekdays and month lengths', () => {
      expect(dayOfWeek('2023-01-01')).toBe(0); // a Sunday
      expect(dayOfWeek('2026-08-20')).toBe(4); // a Thursday
      expect(daysInMonth(2026, 2)).toBe(28);
      expect(daysInMonth(2028, 2)).toBe(29);
      expect(daysInMonth(2026, 12)).toBe(31);
      expect(monthOf('2026-08-20')).toBe('2026-08');
    });

    it('counts range days inclusively', () => {
      expect(inclusiveDayCount('2026-08-20', '2026-08-24')).toBe(5);
      expect(inclusiveDayCount('2026-08-20', '2026-08-20')).toBe(1);
    });
  });

  describe('buildMonthGrid', () => {
    it('produces full weeks with outside cells marked', () => {
      // Aug 2026 starts on a Saturday.
      const weeks = buildMonthGrid('2026-08', 0);
      expect(weeks).toHaveLength(6);
      for (const week of weeks) expect(week).toHaveLength(7);
      expect(weeks[0][6]).toEqual({ date: '2026-08-01', outside: false });
      expect(weeks[0][5]).toEqual({ date: '2026-07-31', outside: true });
      const inside = weeks.flat().filter((cell) => !cell.outside);
      expect(inside).toHaveLength(31);
      expect(inside[0].date).toBe('2026-08-01');
      expect(inside.at(-1)!.date).toBe('2026-08-31');
    });

    it('honours the week start', () => {
      const weeks = buildMonthGrid('2026-08', 1); // Monday start
      // With Monday columns Aug 1 (Saturday) sits at index 5.
      expect(weeks[0][5].date).toBe('2026-08-01');
      expect(weeks[0][0]).toEqual({ date: '2026-07-27', outside: true });
    });
  });

  describe('Intl formatting', () => {
    it('formats dates, month headings and times in the locale', () => {
      expect(formatDate('2026-08-20', 'en-US')).toBe('Aug 20, 2026');
      expect(formatDate('2026-08-20', 'en-US', { dateStyle: 'full' })).toContain('Thursday');
      expect(formatMonthHeading('2026-08', 'en-US')).toBe('August 2026');
      expect(formatTime('15:00', 'en-US', true)).toBe('3:00 PM');
      expect(formatTime('15:00', 'en-US', false)).toBe('15:00');
    });

    it('builds weekday headers from the week start', () => {
      const sunday = weekdayNames('en-US', 0, 'short');
      expect(sunday[0]).toEqual({ label: 'Sun', full: 'Sunday' });
      const monday = weekdayNames('en-US', 1, 'short');
      expect(monday[0].full).toBe('Monday');
      expect(monday[6].full).toBe('Sunday');
    });

    it('derives the locale placeholder pattern', () => {
      expect(localeDatePlaceholder('en-US')).toBe('MM/DD/YYYY');
      expect(localeDatePlaceholder('de-DE')).toBe('DD.MM.YYYY');
    });
  });

  describe('locale plumbing', () => {
    it('reads the numeric field order from Intl', () => {
      expect(localeFieldOrder('en-US')).toEqual(['month', 'day', 'year']);
      expect(localeFieldOrder('de-DE')).toEqual(['day', 'month', 'year']);
    });

    it('maps the locale month names, long and short', () => {
      const names = localeMonthNames('en-US');
      expect(names.get('august')).toBe(8);
      expect(names.get('aug')).toBe(8);
      expect(names.get('dec')).toBe(12);
    });

    it('resolves the locale week start where Intl week info exists', () => {
      const hasWeekInfo =
        'weekInfo' in Intl.Locale.prototype || 'getWeekInfo' in Intl.Locale.prototype;
      if (!hasWeekInfo) {
        expect(localeWeekStart('en-US')).toBe(0); // documented fallback
        return;
      }
      expect(localeWeekStart('en-US')).toBe(0);
      expect(localeWeekStart('de-DE')).toBe(1);
    });
  });

  describe('parseDateText', () => {
    const today = '2026-08-20';
    const parse = (raw: string, locale = 'en-US') => parseDateText(raw, locale, { today });

    it('accepts ISO', () => {
      expect(parse('2026-08-20')).toBe('2026-08-20');
      expect(parse('2026-8-5')).toBe('2026-08-05');
      expect(parse('2026-08-32')).toBeNull();
    });

    it('accepts locale numeric text in the locale digit order', () => {
      expect(parse('8/20/2026')).toBe('2026-08-20');
      expect(parse('12.1.2026')).toBe('2026-12-01');
      expect(parseDateText('20.8.2026', 'de-DE', { today })).toBe('2026-08-20');
      expect(parseDateText('1.12.2026', 'de-DE', { today })).toBe('2026-12-01');
      expect(parse('2026/8/20')).toBe('2026-08-20'); // leading 4-digit year wins
    });

    it('refuses two-digit years rather than guessing', () => {
      expect(parse('8/20/26')).toBeNull();
    });

    it('resolves a missing year to the next occurrence', () => {
      expect(parse('8/21')).toBe('2026-08-21'); // tomorrow
      expect(parse('3/1')).toBe('2027-03-01'); // already passed this year
      expect(parse('8/20')).toBe('2026-08-20'); // today counts as upcoming
    });

    it('accepts the locale month names, long and short, with ordinals', () => {
      expect(parse('aug 21')).toBe('2026-08-21');
      expect(parse('21 aug 2026')).toBe('2026-08-21');
      expect(parse('August 21st, 2026')).toBe('2026-08-21');
      expect(parse('mar 1')).toBe('2027-03-01'); // next occurrence
    });

    it('refuses what it cannot read', () => {
      expect(parse('aug 32')).toBeNull();
      expect(parse('not a date')).toBeNull();
      expect(parse('')).toBeNull();
      expect(parse('2026-02-30')).toBeNull();
    });
  });

  describe('parseTimeText', () => {
    it('accepts the documented shorthand forms', () => {
      expect(parseTimeText('9', false)).toBe('09:00');
      expect(parseTimeText('930', false)).toBe('09:30');
      expect(parseTimeText('9:30', false)).toBe('09:30');
      expect(parseTimeText('9.30', false)).toBe('09:30');
      expect(parseTimeText('9 30', false)).toBe('09:30');
      expect(parseTimeText('3p', false)).toBe('15:00');
      expect(parseTimeText('3pm', false)).toBe('15:00');
      expect(parseTimeText('3 PM', false)).toBe('15:00');
      expect(parseTimeText('12am', false)).toBe('00:00');
      expect(parseTimeText('12pm', false)).toBe('12:00');
      expect(parseTimeText('15:00', false)).toBe('15:00');
    });

    it('leans PM for bare small hours only in 12-hour fields', () => {
      expect(parseTimeText('3', true)).toBe('15:00');
      expect(parseTimeText('3', false)).toBe('03:00');
      expect(parseTimeText('8', true)).toBe('08:00'); // 8 is morning either way
      expect(parseTimeText('3am', true)).toBe('03:00'); // explicit meridiem wins
    });

    it('refuses what it cannot read', () => {
      expect(parseTimeText('25:00', false)).toBeNull();
      expect(parseTimeText('9:75', false)).toBeNull();
      expect(parseTimeText('13pm', false)).toBeNull();
      expect(parseTimeText('soon', false)).toBeNull();
    });
  });

  describe('timeSlots', () => {
    it('generates the step grid inside the fences', () => {
      expect(timeSlots(30, '09:00', '10:30')).toEqual(['09:00', '09:30', '10:00', '10:30']);
      expect(timeSlots(60, '22:00')).toEqual(['22:00', '23:00']);
      expect(timeSlots(30)).toHaveLength(48);
    });
  });

  describe('combined values', () => {
    it('splits and joins, emitting only when both parts exist', () => {
      expect(splitDateTime('2026-08-20T15:00')).toEqual({ date: '2026-08-20', time: '15:00' });
      expect(splitDateTime(undefined)).toEqual({});
      expect(joinDateTime('2026-08-20', '15:00')).toBe('2026-08-20T15:00');
      expect(joinDateTime('2026-08-20', undefined)).toBeUndefined();
      expect(joinDateTime(undefined, '15:00')).toBeUndefined();
    });
  });
});
