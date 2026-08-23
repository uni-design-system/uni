import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button/button.component';
import { UniInputComponent } from '../input/input.component';
import { UniStackDirective } from '../layout';
import { UniCalloutComponent as Callout } from './callout.component';

type StoryType = Callout;

const meta: Meta<StoryType> = {
  title: 'Components/Surfaces/Callout',
  component: Callout,
  parameters: {
    componentSubtitle: 'Spotlight coach mark — dims the page, cuts a hole around its target',
  },
  decorators: [
    moduleMetadata({
      imports: [UniButtonComponent, UniInputComponent, UniStackDirective],
    }),
  ],
};

export default meta;
type Story = StoryObj<StoryType>;

/**
 * The hole is anchor-positioned: scroll the page while it is open and the
 * spotlight tracks the field with zero listeners. The target stays fully
 * interactive — type through the hole.
 */
export const Spotlight: Story = {
  render: () => ({
    props: { open: false },
    template: `
      <div stack-layout gap="md">
        <button text-button (click)="open = true">Show me around</button>
        <uni-input label="Search projects" id="callout-demo-search"></uni-input>
        <uni-callout
          [(open)]="open"
          key="search-intro"
          target="callout-demo-search"
          header="Find anything"
          placement="bottom"
        >
          Type to filter projects, people, and documents — try it right here.
          <button text-button callout-actions size="sm" variant="secondary" (click)="open = false">Got it</button>
        </uni-callout>
      </div>
    `,
  }),
};

/** `targetInteractive=false` covers the hole: look, don't touch. */
export const LockedSpotlight: Story = {
  render: () => ({
    props: { open: false },
    template: `
      <div stack-layout gap="md">
        <button text-button (click)="open = true">Explain the report</button>
        <uni-input label="Weekly report" id="callout-demo-report"></uni-input>
        <uni-callout
          [(open)]="open"
          target="callout-demo-report"
          [targetInteractive]="false"
          header="Read-only for now"
          variant="secondary"
        >
          Reports unlock after your first project ships.
          <button text-button callout-actions size="sm" variant="secondary" (click)="open = false">OK</button>
        </uni-callout>
      </div>
    `,
  }),
};

/** No target: the panel centers over a full-viewport dim. */
export const Dim: Story = {
  render: () => ({
    props: { open: false },
    template: `
      <div stack-layout gap="md">
        <button text-button (click)="open = true">What's new</button>
        <uni-callout [(open)]="open" header="March release">
          Calendar inputs, themable focus rings, and release notes in the MCP server.
          <button text-button callout-actions size="sm" variant="secondary" (click)="open = false">Nice</button>
        </uni-callout>
      </div>
    `,
  }),
};

/** `backdrop="none"`: just an anchored panel, page fully usable. */
export const NoBackdrop: Story = {
  render: () => ({
    props: { open: false },
    template: `
      <div stack-layout gap="md">
        <button text-button (click)="open = true">Hint</button>
        <uni-input label="Amount" id="callout-demo-amount"></uni-input>
        <uni-callout [(open)]="open" target="callout-demo-amount" backdrop="none" header="Pro tip">
          Press ↑/↓ to step the amount.
        </uni-callout>
      </div>
    `,
  }),
};

/**
 * `key` + `dismissed` are the "don't show again" hooks — persistence stays in
 * the app (e.g. the cdk local-storage service).
 */
export const DismissalTracking: Story = {
  render: () => ({
    props: {
      open: false,
      log: [] as string[],
      record(dismissal: { key?: string; reason: string }) {
        this.log = [...this.log, `${dismissal.key}: ${dismissal.reason}`];
      },
    },
    template: `
      <div stack-layout gap="md">
        <button text-button (click)="open = true">Show the callout</button>
        <uni-input label="Owner" id="callout-demo-owner"></uni-input>
        <uni-callout
          [(open)]="open"
          key="owner-intro"
          target="callout-demo-owner"
          header="Assign an owner"
          [dismissOnBackdrop]="true"
          (dismissed)="record($event)"
        >
          Every project needs one accountable owner.
        </uni-callout>
        <div>
          @for (entry of log; track $index) {
            <div>{{ entry }}</div>
          }
        </div>
      </div>
    `,
  }),
};
