import { Meta, StoryObj } from '@storybook/angular';
import { addDays, monthOf, todayIso } from '../../cdk';
import { UniDateInputComponent } from './date-input.component';

const TODAY = todayIso();
const MONTH = monthOf(TODAY);
const dayIn = (day: number) => `${MONTH}-${String(day).padStart(2, '0')}`;

const meta: Meta<UniDateInputComponent> = {
  title: 'Components/Forms/Date Input',
  component: UniDateInputComponent,
  args: { label: 'Due date' },
  argTypes: {
    value: { description: "The canonical value, always 'YYYY-MM-DD' — never a Date object" },
    displayFormat: {
      description: "Intl.DateTimeFormatOptions for the committed text, default { dateStyle: 'medium' }",
    },
    placeholder: { description: "Defaults to the locale's digit pattern, e.g. MM/DD/YYYY" },
    parse: { description: 'Custom parser (raw, locale) => UniDate | null, replacing the built-in' },
    commitOnBlur: { description: 'Commit typed text when focus leaves the field (default true)' },
    minDate: { description: 'Earliest allowed date; typed commits outside it are rejected' },
    maxDate: { description: 'Latest allowed date' },
    disabledDates: { description: 'Blocked days: a UniDate[] or a predicate (date) => boolean' },
    markers: { description: 'Availability dots forwarded to the popup calendar' },
    rejected: {
      description: "Refused commits: { raw, reason: 'unparseable' | 'out-of-range' | 'disabled' }",
    },
  },
  parameters: {
    componentSubtitle: 'Free-typed date entry with a popup calendar',
  },
};

export default meta;
type Story = StoryObj<UniDateInputComponent>;

export const Primary: Story = {
  args: { value: dayIn(12) },
};

/**
 * The fences and availability forward to the popup calendar, and typed
 * commits are checked against them — `aug 32`, a fenced date or a fully
 * booked day all stay in the field, flagged, with a `(rejected)` reason.
 */
export const WithCalendarConstraints: Story = {
  args: {
    label: 'Appointment date',
    minDate: TODAY,
    maxDate: addDays(TODAY, 45),
    disabledDates: (date: string) => [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay()),
    markers: [
      { date: addDays(TODAY, 1), variant: 'success', label: '3 slots open' },
      { date: addDays(TODAY, 3), variant: 'primary', label: '1 slot open' },
    ],
  },
};

/** The committed text renders in any Intl format; the value stays ISO. */
export const DisplayFormat: Story = {
  args: { value: dayIn(12), displayFormat: { dateStyle: 'full' } },
};

export const Disabled: Story = {
  args: { value: dayIn(12), disabled: true },
};
