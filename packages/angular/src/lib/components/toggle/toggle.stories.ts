import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniToggleComponent as ToggleComponent } from './toggle.component';
import { UniBoxDirective, UniRowDirective, UniStackDirective } from '../layout';

type StoryType = ToggleComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Toggle',
  component: ToggleComponent,
  decorators: [
    moduleMetadata({
      imports: [UniStackDirective, UniRowDirective, UniBoxDirective, ],
    }),
  ],
  render: (args) => ({
    props: {
      ...args,
    },
    template: `<uni-toggle ${argsToTemplate(args)}></uni-toggle>`,
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
    checked: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {
  args: {
    label: 'Enable notifications',
    variant: 'primary',
    disabled: false,
    checked: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    label: '',
    variant: 'primary',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled toggle',
    variant: 'primary',
    disabled: true,
  },
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="md">
        <uni-toggle label="Primary" variant="primary"></uni-toggle>
        <uni-toggle label="Secondary" variant="secondary"></uni-toggle>
        <uni-toggle label="Success" variant="success"></uni-toggle>
        <uni-toggle label="Warning" variant="warn"></uni-toggle>
        <uni-toggle label="Tertiary" variant="tertiary"></uni-toggle>
      </div>
    `,
  }),
};

export const WithChangeEvent: Story = {
  render: () => ({
    template: `
      <div>
        <uni-toggle
          label="Toggle me"
          [checked]="isChecked"
          (checkedChange)="onToggleChange($event)"
          variant="primary">
        </uni-toggle>
        <div box-layout paddingTop="md">
          Current state: {{ isChecked ? 'On' : 'Off' }}
        </div>
        <div box-layout paddingTop="sm">
          Last change: {{ lastChangeValue }}
        </div>
      </div>
    `,
    props: {
      isChecked: false,
      lastChangeValue: 'None',
      onToggleChange: (value: boolean) => {
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
        <uni-toggle
          label="Enable feature"
          variant="primary"
          [checked]="isChecked"
          [disabled]="isDisabled"
          [invalid]="isInvalid"
          [touched]="isTouched">
        </uni-toggle>
        <div box-layout paddingTop="md">
          <p>Checked: {{ isChecked }}</p>
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
      isChecked: false,
      isTouched: false,
      isInvalid: false,
      isDisabled: false,
    },
  }),
};
