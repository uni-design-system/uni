import { Meta, StoryObj } from '@storybook/angular';
import { addDays, monthOf, todayIso } from '../../cdk';
import { UniCalendarComponent } from './calendar.component';

const TODAY = todayIso();
const MONTH = monthOf(TODAY);
const dayIn = (day: number) => `${MONTH}-${String(day).padStart(2, '0')}`;

const meta: Meta<UniCalendarComponent> = {
  title: 'Components/Forms/Calendar',
  component: UniCalendarComponent,
  args: { ariaLabel: 'Calendar' },
  argTypes: {
    mode: {
      description: "'single' reads/writes a UniDate; 'range' a UniDateRange { start, end }",
    },
    value: { description: "ISO strings only: '2026-08-20', or { start, end } in range mode" },
    month: { description: "Shown month 'YYYY-MM' — two-way, so an app can drive navigation" },
    minDate: { description: 'Earliest selectable date (inclusive); arrows stop at the fence' },
    maxDate: { description: 'Latest selectable date (inclusive)' },
    disabledDates: { description: 'Blocked days: a UniDate[] or a predicate (date) => boolean' },
    markers: { description: 'Availability dots: { date, variant?, label? }[]' },
    weekStart: { description: '0 = Sunday … 6 = Saturday; defaults from the locale' },
    size: { description: 'Day-cell geometry from the theme: sm | md | lg' },
  },
};

export default meta;
type Story = StoryObj<UniCalendarComponent>;

export const Primary: Story = {
  args: { value: dayIn(12), month: MONTH },
};

/**
 * `mode="range"`: first commit starts the range, moving focus or hovering
 * paints a preview, the second commit ends it. Committing a day before the
 * start swaps the ends; Escape cancels a pending range.
 */
export const Range: Story = {
  args: { mode: 'range', value: { start: dayIn(3), end: dayIn(7) }, month: MONTH },
};

/**
 * Markers carry app data onto days — the scheduling pattern. The `label`
 * joins the day's accessible name ("… 3 slots open"); the `variant` picks
 * the dot's color role.
 */
export const Markers: Story = {
  args: {
    month: MONTH,
    markers: [
      { date: dayIn(4), variant: 'success', label: '3 slots open' },
      { date: dayIn(4), variant: 'primary' },
      { date: dayIn(16), variant: 'warn', label: '1 slot open' },
      { date: dayIn(24), variant: 'secondary' },
    ],
  },
};

/**
 * `minDate`/`maxDate` fence the grid and the keyboard (arrows stop, never
 * wrap); `disabledDates` blocks days inside the fence — here, weekends.
 */
export const FencedAndDisabled: Story = {
  args: {
    month: MONTH,
    minDate: dayIn(5),
    maxDate: dayIn(25),
    disabledDates: (date: string) => [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay()),
  },
};

/** Sizes carry geometry only — day square and font size per size token. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <uni-calendar size="sm" ariaLabel="Small" month="${MONTH}" />
      <uni-calendar size="md" ariaLabel="Medium" month="${MONTH}" />
      <uni-calendar size="lg" ariaLabel="Large" month="${MONTH}" />
    `,
  }),
};

/**
 * All formatting comes from `Intl`: month heading, weekday names and the
 * week's first day follow the locale (overridable with `weekStart`).
 */
export const LocaleAndWeekStart: Story = {
  args: { locale: 'de-DE', weekStart: 1, month: MONTH, value: dayIn(12) },
};

/** Availability drives everything: markers, disabled days and the fences. */
export const Scheduling: Story = {
  render: () => {
    const horizon = addDays(TODAY, 45);
    const pool = ['09:00', '09:30', '10:00', '11:00', '13:30', '14:00', '15:00', '16:30'];
    const availability = (date: string): string[] => {
      const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
      if ([0, 3, 6].includes(weekday) || date < TODAY || date > horizon) return [];
      let hash = 0;
      for (const char of date) hash = (hash * 31 + char.charCodeAt(0)) % 997;
      const count = 1 + (hash % 4);
      const start = hash % (pool.length - count + 1);
      return pool.slice(start, start + count);
    };
    const markers = [];
    for (let date = TODAY; date <= horizon; date = addDays(date, 1)) {
      const slots = availability(date);
      if (slots.length) {
        markers.push({
          date,
          variant: slots.length >= 3 ? 'success' : 'primary',
          label: `${slots.length} ${slots.length === 1 ? 'slot' : 'slots'} open`,
        });
      }
    }
    return {
      props: {
        markers,
        minDate: TODAY,
        maxDate: horizon,
        isFullyBooked: (date: string) => availability(date).length === 0,
      },
      template: `
        <uni-calendar
          ariaLabel="Appointment date"
          [minDate]="minDate"
          [maxDate]="maxDate"
          [disabledDates]="isFullyBooked"
          [markers]="markers"
        />
      `,
    };
  },
};
