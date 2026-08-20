import { Meta, StoryObj } from '@storybook/angular';
import { UniTimeInputComponent } from './time-input.component';

const meta: Meta<UniTimeInputComponent> = {
  title: 'Components/Forms/Time Input',
  component: UniTimeInputComponent,
  args: { label: 'Start time' },
  argTypes: {
    value: { description: "The canonical value, always 24-hour 'HH:mm'; hour12 is display only" },
    minuteStep: { description: 'Generated list granularity in minutes (default 30)' },
    minTime: { description: "Earliest allowed time, '09:00'" },
    maxTime: { description: "Latest allowed time, '17:00'" },
    slots: {
      description: 'Exact allowed times (scheduling); typed entry must then match one',
    },
    hour12: { description: '12-hour display; defaults from the locale' },
    rejected: {
      description:
        "Refused commits: { raw, reason: 'unparseable' | 'out-of-range' | 'unavailable' }",
    },
  },
  parameters: {
    componentSubtitle: 'Combobox over time slots — type 3p or pick 3:00 PM',
  },
};

export default meta;
type Story = StoryObj<UniTimeInputComponent>;

export const Primary: Story = {
  args: { minTime: '09:00', maxTime: '17:00', minuteStep: 30, value: '09:30' },
};

/**
 * `slots` pins the choices: the list shows exactly the given times and a
 * typed `3pm` commits only if `15:00` is among them — otherwise it stays in
 * the field with `reason: 'unavailable'`.
 */
export const Slots: Story = {
  args: { label: 'Slot time', slots: ['09:00', '09:30', '11:00', '14:30'] },
};

/** `hour12` only changes display and option labels — the value stays 24h. */
export const TwentyFourHour: Story = {
  args: { hour12: false, minTime: '08:00', maxTime: '18:00', value: '15:00' },
};

export const Disabled: Story = {
  args: { value: '09:30', disabled: true },
};
