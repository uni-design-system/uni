import { Component, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniToggleComponent as ToggleComponent } from './toggle.component';
import { UniBoxDirective, UniRowDirective, UniStackDirective } from '../layout';

/**
 * Host for the Signal Forms story. `form()` calls `inject()`, so it has to be
 * built inside a component — a story's `render` function is not an injection
 * context, and building it there fails at runtime with NG0203.
 */
@Component({
  selector: 'toggle-form-demo',
  imports: [ToggleComponent, FormField, UniBoxDirective, UniStackDirective],
  template: `
    <div stack-layout gap="md">
      <uni-toggle label="Enable feature" [formField]="settings.enabled" />
      <div box-layout>
        <p>Model: {{ model().enabled }}</p>
        <p>Touched: {{ settings.enabled().touched() }}</p>
        <p>Valid: {{ settings.enabled().valid() }}</p>
      </div>
    </div>
  `,
})
class ToggleFormDemo {
  readonly model = signal({ enabled: false });
  readonly settings = form(this.model, (path) => {
    required(path.enabled);
  });
}

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
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description:
        "Track geometry from the theme's `toggle` sizes block. Default: 'lg'",
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

/**
 * The three size tokens, each a `width` / `height` / `padding` triple in the
 * theme's `toggle` sizes block. Knob diameter and travel derive from those, so
 * a theme can match an existing switch design exactly rather than accept a
 * fixed set of proportions.
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="md">
        <uni-toggle label="Small — 28x16" size="sm" [checked]="true"></uni-toggle>
        <uni-toggle label="Medium — 32x18" size="md" [checked]="true"></uni-toggle>
        <uni-toggle label="Large — 40x20 (default)" size="lg" [checked]="true"></uni-toggle>
      </div>
    `,
  }),
};

/**
 * `checkedColor` sets the on-state independently of `variant`. Set it once in
 * the theme (`toggle.behavior.checkedColor`) to give a whole app one switch
 * colour; the input is the per-instance escape hatch.
 */
export const CheckedColor: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="md">
        <uni-toggle label="Variant primary (default)" [checked]="true"></uni-toggle>
        <uni-toggle label="checkedColor success" checkedColor="success" [checked]="true"></uni-toggle>
        <uni-toggle label="checkedColor tertiary" checkedColor="tertiary" [checked]="true"></uni-toggle>
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

/**
 * A real Signal Forms binding: `uni-toggle` implements `FormCheckboxControl`, so
 * Angular's `[formField]` directive drives `checked`, `touched`, `invalid` and
 * `required` from the field, and writes user interaction back to the model.
 *
 * Note the selector is **`[formField]`**, not `[field]` — the latter was the
 * Angular 21.0 preview name and no longer exists.
 */
export const FormSignals: Story = {
  render: () => ({
    moduleMetadata: { imports: [ToggleFormDemo] },
    // The binding this demonstrates, for anyone reading the source:
    //   <uni-toggle label="Enable feature" [formField]="settings.enabled" />
    // built from `form(model, path => required(path.enabled))` in the host.
    template: `<toggle-form-demo />`,
  }),
};
