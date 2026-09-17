import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniRadioComponent as RadioComponent } from './radio.component';
import { UniBoxDirective, UniRowDirective, UniStackDirective } from '../layout';
import { UniTextDirective } from '../text/text.directive';
import { UniRadioOptionDirective } from './radio-option.directive';

type StoryType = RadioComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Radio',
  component: RadioComponent,
  decorators: [
    moduleMetadata({
      imports: [
        UniStackDirective,
        UniRowDirective,
        UniBoxDirective,
        UniTextDirective,
        UniRadioOptionDirective,
      ],
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
      description:
        "The group's heading and accessible name, drawn in the theme's `radio.groupTextRole` typeface — separate from the options' `radio.textRole`.",
    },
    labelHidden: {
      control: 'boolean',
      description:
        'Keep `label` as the group name without drawing the heading. Default: false',
    },
    fullWidth: {
      control: 'boolean',
      description:
        'Stretch each option row across the container, so the whole width is the hit target. Default: false',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: "Circle geometry from the theme's `radio` sizes block. Default: 'lg'",
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
      <div stack-layout gap="md">
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
        <div box-layout paddingTop="md">
          Current selection: {{ selectedValue || 'None' }}
        </div>
        <div box-layout paddingTop="sm">
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
        <div box-layout paddingTop="md">
          <p>Value: {{ currentValue }}</p>
          <p>Touched: {{ isTouched }}</p>
          <p>Invalid: {{ isInvalid }}</p>
          <p>Disabled: {{ isDisabled }}</p>
        </div>
        <div row-layout gap="sm" paddingTop="sm">
        <button
          (click)="isTouched = true">
          Mark as Touched
        </button>
        <button
          (click)="isDisabled = !isDisabled">
          Toggle Disabled
        </button>
        <button
          (click)="isInvalid = !isInvalid">
          Toggle Invalid
        </button>
        </div>
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

/**
 * Per-option content, in place of the plain label string. A group renders N
 * labels from data, so it has no single slot to project into — the template is
 * instantiated once per option and handed that option.
 */
export const OptionTemplate: Story = {
  render: () => ({
    props: {
      plans: [
        { label: 'Basic', value: 'basic' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      descriptions: {
        basic: 'One project, community support',
        pro: 'Ten projects, email support',
        enterprise: 'Unlimited projects, a named engineer',
      } as Record<string, string>,
    },
    template: `
      <uni-radio [options]="plans" value="pro" label="Plan" fullWidth>
        <ng-template uniRadioOption let-option>
          <span stack-layout gap="xxs">
            <span uni-text="body-2-long">{{ option.label }}</span>
            <span uni-text="caption">{{ descriptions[option.value] }}</span>
          </span>
        </ng-template>
      </uni-radio>
    `,
  }),
};

/** The heading and the options are two levels of one hierarchy, themed apart. */
export const Sizes: Story = {
  render: () => ({
    props: {
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
      ],
    },
    template: `
      <div stack-layout gap="lg">
        <uni-radio size="sm" label="Small" [options]="options" value="sm"></uni-radio>
        <uni-radio size="md" label="Medium" [options]="options" value="sm"></uni-radio>
        <uni-radio size="lg" label="Large" [options]="options" value="sm"></uni-radio>
      </div>
    `,
  }),
};
