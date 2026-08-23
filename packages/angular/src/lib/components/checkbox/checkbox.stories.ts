import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniCheckboxComponent as CheckboxComponent } from './checkbox.component';
import { UniBoxDirective, UniRowDirective, UniStackDirective } from '../layout';

type StoryType = CheckboxComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Checkbox',
  component: CheckboxComponent,
  decorators: [
    moduleMetadata({
      imports: [UniStackDirective, UniRowDirective, UniBoxDirective, ],
    }),
  ],
  render: (args) => ({
    props: {
      ...args,
    },
    template: `<uni-checkbox ${argsToTemplate(args)}></uni-checkbox>`,
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
    label: 'Accept terms and conditions',
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
    label: 'Disabled checkbox',
    variant: 'primary',
    disabled: true,
  },
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="md">
        <uni-checkbox label="Primary" variant="primary"></uni-checkbox>
        <uni-checkbox label="Secondary" variant="secondary"></uni-checkbox>
        <uni-checkbox label="Success" variant="success"></uni-checkbox>
        <uni-checkbox label="Warning" variant="warn"></uni-checkbox>
        <uni-checkbox label="Tertiary" variant="tertiary"></uni-checkbox>
      </div>
    `,
  }),
};

export const WithChangeEvent: Story = {
  render: () => ({
    template: `
      <div>
        <uni-checkbox
          label="Check me"
          [checked]="isChecked"
          (checkedChange)="onCheckboxChange($event)"
          variant="primary">
        </uni-checkbox>
        <div box-layout paddingTop="md">
          Current state: {{ isChecked ? 'Checked' : 'Unchecked' }}
        </div>
        <div box-layout paddingTop="sm">
          Last change: {{ lastChangeValue }}
        </div>
      </div>
    `,
    props: {
      isChecked: false,
      lastChangeValue: 'None',
      onCheckboxChange: (value: boolean) => {
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
        <uni-checkbox
          label="Subscribe to newsletter"
          variant="primary"
          [checked]="isChecked"
          [disabled]="isDisabled"
          [invalid]="isInvalid"
          [touched]="isTouched">
        </uni-checkbox>
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
