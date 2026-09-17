import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniCheckboxComponent as CheckboxComponent } from './checkbox.component';
import { UniBoxDirective, UniRowDirective, UniStackDirective } from '../layout';
import { UniTextDirective } from '../text/text.directive';

type StoryType = CheckboxComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Checkbox',
  component: CheckboxComponent,
  decorators: [
    moduleMetadata({
      imports: [UniStackDirective, UniRowDirective, UniBoxDirective, UniTextDirective],
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
      description:
        "The checkbox's accessible name, drawn beside the box in the theme's `checkbox.textRole` typeface.",
    },
    labelHidden: {
      control: 'boolean',
      description:
        'Keep `label` as the accessible name without drawing it — for a select column or a row whose meaning is already on screen. Default: false',
    },
    fullWidth: {
      control: 'boolean',
      description:
        'Stretch the control and its label across the container, so the whole width is the hit target. Default: false',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: "Box geometry from the theme's `checkbox` sizes block. Default: 'lg'",
    },
    disabled: {
      control: 'boolean',
    },
    checked: {
      control: 'boolean',
      description:
        'Checked state. Bind it two-way (`[(checked)]`) or hold the value in your own signal — a change your app declines will not snap back on its own.',
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

export const HiddenLabel: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="md">
        <div row-layout gap="sm" alignItems="center">
          <uni-checkbox label="Select every line from Northwind" labelHidden></uni-checkbox>
          <span uni-text="body-1-short">Northwind Traders</span>
        </div>
        <div row-layout gap="sm" alignItems="center">
          <uni-checkbox label="Select every line from Contoso" labelHidden></uni-checkbox>
          <span uni-text="body-1-short">Contoso Ltd</span>
        </div>
      </div>
    `,
  }),
};

export const RowAsHitTarget: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="xs">
        <uni-checkbox fullWidth>
          <span uni-text="body-2-long">Sofa, three seat</span>
          <span uni-text="caption">In stock</span>
        </uni-checkbox>
        <uni-checkbox fullWidth>
          <span uni-text="body-2-long">Armchair, walnut</span>
          <span uni-text="caption">Backordered</span>
        </uni-checkbox>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="md">
        <uni-checkbox size="sm" label="Small" checked></uni-checkbox>
        <uni-checkbox size="md" label="Medium" checked></uni-checkbox>
        <uni-checkbox size="lg" label="Large" checked></uni-checkbox>
      </div>
    `,
  }),
};
