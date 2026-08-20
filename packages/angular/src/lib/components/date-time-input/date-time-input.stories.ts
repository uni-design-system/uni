import { Meta, StoryObj } from '@storybook/angular';
import { addDays, todayIso } from '../../cdk';
import { UniDateTimeInputComponent } from './date-time-input.component';

const TODAY = todayIso();

const meta: Meta<UniDateTimeInputComponent> = {
  title: 'Components/Forms/Date Time Input',
  component: UniDateTimeInputComponent,
  args: { label: 'Appointment' },
  argTypes: {
    value: {
      description:
        "The combined value 'YYYY-MM-DDTHH:mm' — emits only when both parts are set; clearing the date clears it",
    },
    label: { description: 'Names the group; the parts announce as "Date" and "Time" under it' },
    minDateTime: { description: 'Earliest allowed moment, split into date and time fences' },
    maxDateTime: { description: 'Latest allowed moment' },
    slotsFor: {
      description:
        'Scheduling: (date) => UniTime[] — the time part stays disabled until a day is chosen, then offers exactly its slots',
    },
    slots: { description: 'Fixed time choices; superseded per-day by slotsFor' },
  },
  parameters: {
    componentSubtitle: 'One field, one combined value — a date and a time',
  },
};

export default meta;
type Story = StoryObj<UniDateTimeInputComponent>;

export const Primary: Story = {
  args: { value: `${addDays(TODAY, 1)}T15:00` },
};

/**
 * The scheduling flow in one attribute: `slotsFor` gates the time part on a
 * chosen day and offers exactly that day's slots; changing the day clears a
 * slot the new day no longer offers. The availability here is deterministic
 * fake data — closed weekends and Wednesdays, 1–4 slots otherwise.
 */
export const Scheduling: Story = {
  render: (args) => {
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
        ...args,
        markers,
        minDate: TODAY,
        slotsFor: availability,
        isFullyBooked: (date: string) => availability(date).length === 0,
      },
      template: `
        <uni-date-time-input
          label="Appointment"
          [disabledDates]="isFullyBooked"
          [markers]="markers"
          [slotsFor]="slotsFor"
        />
      `,
    };
  },
};

export const Disabled: Story = {
  args: { value: `${addDays(TODAY, 1)}T15:00`, disabled: true },
};
