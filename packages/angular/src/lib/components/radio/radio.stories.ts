import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniRadioComponent as RadioComponent } from './radio.component';

type StoryType = RadioComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Radio',
  component: RadioComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
  render: (args) => ({
    props: {
      ...args,
    },
    template: `<uni-radio ${argsToTemplate(args)}></uni-radio>`,
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'ghost',
        'primary',
        'secondary',
        'tertiary',
        'quaternary',
        'warn',
        'success',
        'disabled',
        'light',
        'onLight',
        'dark',
        'onDark',
      ],
    },
    label: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    value: {
      control: 'text',
    },
    name: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

const defaultOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

export const Default: Story = {
  args: {
    label: 'Select an option',
    variant: 'primary',
    disabled: false,
    value: 'option1',
    name: 'radio-group',
    options: defaultOptions,
  },
};

export const WithoutLabel: Story = {
  args: {
    label: '',
    variant: 'primary',
    disabled: false,
    value: '',
    name: 'radio-group',
    options: defaultOptions,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled radio group',
    variant: 'primary',
    disabled: true,
    value: 'option1',
    name: 'radio-group',
    options: defaultOptions,
  },
};

export const WithDisabledOptions: Story = {
  args: {
    label: 'Some options disabled',
    variant: 'primary',
    disabled: false,
    value: 'option1',
    name: 'radio-group',
    options: [
      { label: 'Available Option', value: 'option1' },
      { label: 'Disabled Option', value: 'option2', disabled: true },
      { label: 'Another Available', value: 'option3' },
    ],
  },
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <uni-radio label="Primary" variant="primary" [options]="options" name="primary-group"></uni-radio>
        <uni-radio label="Secondary" variant="secondary" [options]="options" name="secondary-group"></uni-radio>
        <uni-radio label="Success" variant="success" [options]="options" name="success-group"></uni-radio>
        <uni-radio label="Warning" variant="warn" [options]="options" name="warn-group"></uni-radio>
        <uni-radio label="Tertiary" variant="tertiary" [options]="options" name="tertiary-group"></uni-radio>
      </div>
    `,
    props: {
      options: defaultOptions,
    },
  }),
};

export const WithChangeEvent: Story = {
  render: () => ({
    template: `
      <div>
        <uni-radio
          label="Pick your favorite"
          [options]="options"
          [value]="selectedValue"
          (valueChange)="onRadioChange($event)"
          variant="primary"
          name="favorites">
        </uni-radio>
        <div style="margin-top: 16px;">
          Current selection: {{ selectedValue || 'None' }}
        </div>
        <div style="margin-top: 8px;">
          Last change: {{ lastChangeValue }}
        </div>
      </div>
    `,
    props: {
      selectedValue: '',
      lastChangeValue: 'None',
      options: [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Cherry', value: 'cherry' },
      ],
      onRadioChange: (value: string) => {
        console.log(value);
        // This will be handled by the component in real usage
      },
    },
  }),
};

export const FormSignals: Story = {
  render: () => ({
    template: `
      <div>
        <uni-radio
          label="Select your choice"
          variant="primary"
          [options]="options"
          [value]="currentValue"
          [disabled]="isDisabled"
          [invalid]="isInvalid"
          [touched]="isTouched"
          name="signals-demo">
        </uni-radio>
        <div style="margin-top: 16px;">
          <p>Value: {{ currentValue }}</p>
          <p>Touched: {{ isTouched }}</p>
          <p>Invalid: {{ isInvalid }}</p>
          <p>Disabled: {{ isDisabled }}</p>
        </div>
        <button
          (click)="isTouched = true"
          style="margin-top: 8px; margin-right: 8px;">
          Mark as Touched
        </button>
        <button
          (click)="isDisabled = !isDisabled"
          style="margin-top: 8px; margin-right: 8px;">
          Toggle Disabled
        </button>
        <button
          (click)="isInvalid = !isInvalid"
          style="margin-top: 8px;">
          Toggle Invalid
        </button>
      </div>
    `,
    props: {
      currentValue: 'option1',
      isTouched: false,
      isInvalid: false,
      isDisabled: false,
      options: defaultOptions,
    },
  }),
};
