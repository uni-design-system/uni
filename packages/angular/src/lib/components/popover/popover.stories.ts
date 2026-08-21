import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button/button.component';
import { UniInputComponent } from '../input/input.component';
import { UniStackComponent } from '../layout';
import { UniTextComponent } from '../text/text.component';
import { UniPopoverComponent as Popover } from './popover.component';

type StoryType = Popover;

const meta: Meta<StoryType> = {
  title: 'Components/Surfaces/Popover',
  component: Popover,
  parameters: {
    componentSubtitle: 'Anchored top-layer panel — disclosure by default, tooltip by mode',
  },
  decorators: [
    moduleMetadata({
      imports: [UniButtonComponent, UniInputComponent, UniStackComponent, UniTextComponent],
    }),
  ],
  render: (args) => {
    const { placement, autoClose, arrow } = args;
    return {
      props: args,
      template: `
        <uni-popover placement="${placement}" [autoClose]="${autoClose}" [arrow]="${arrow}" #popover>
          <button text-button trigger>Open Popover</button>
          <div stack-layout gap="sm">
            <div>
              <span uni-text="title-small" display="block">
              This is a Popover.
              </span>
              It is possible to add any markup you want to a Popover.
            </div>
            <div>
              <button text-button symbolLeft="thumb_up" size="sm" variant="secondary" (click)="popover.hidePopover()">OK!</button>
            </div>
          </div>
        </uni-popover>
      `,
    };
  },
  argTypes: {
    placement: {
      description:
        'Controls the orientation of the popover in relation to the anchor. ' +
        'If the placement falls outside the viewport, the browser flips it ' +
        'so it remains in view.',
    },
    autoClose: {
      description:
        'Controls whether clicking anywhere outside the popover (or Escape) closes it.',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    placement: 'right-start',
    autoClose: true,
    arrow: true,
  },
};

/** Header + close button + footer actions; `autofocus` seeds the field. */
export const StructuredForm: Story = {
  render: () => ({
    template: `
      <uni-popover header="Rename view" [closable]="true" #popover>
        <button text-button trigger>Rename…</button>
        <uni-input label="Name" autofocus></uni-input>
        <button text-button popover-footer size="sm" variant="secondary" (click)="popover.hidePopover()">Apply</button>
      </uni-popover>
    `,
  }),
};

/**
 * The panel anchors to the field while the trigger keeps the disclosure ARIA —
 * anchoring and control are separate.
 */
export const DetachedAnchor: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="md">
        <uni-input label="Project name" id="detached-demo-field"></uni-input>
        <uni-popover anchor="detached-demo-field" placement="bottom-start" header="Naming rules">
          <button text-button trigger size="sm" variant="ghost">Show naming rules</button>
          Lowercase, dashes for spaces, unique within the workspace.
        </uni-popover>
      </div>
    `,
  }),
};

/**
 * Tooltip mode: hover or focus the trigger. Content must stay non-interactive;
 * the panel is hoverable and Escape-dismissable (WCAG 1.4.13).
 */
export const TooltipMode: Story = {
  render: () => ({
    template: `
      <uni-popover mode="tooltip" placement="top">
        <button text-button trigger variant="ghost">Publishing</button>
        Publishes to every connected space at once.
      </uni-popover>
    `,
  }),
};

/** Manual close: no light dismiss — the content owns the exit. */
export const ManualClose: Story = {
  render: () => ({
    template: `
      <uni-popover [autoClose]="false" header="Cookie consent" #popover>
        <button text-button trigger>Preferences</button>
        This panel ignores outside clicks.
        <button text-button popover-footer size="sm" (click)="popover.hidePopover()">Save</button>
      </uni-popover>
    `,
  }),
};
