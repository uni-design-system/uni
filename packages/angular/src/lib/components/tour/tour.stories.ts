import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button/button.component';
import { UniInputComponent } from '../input/input.component';
import { UniStackDirective } from '../layout';
import type { UniTourStep } from './tour.model';
import { UniTourComponent as Tour } from './tour.component';

type StoryType = Tour;

const meta: Meta<StoryType> = {
  title: 'Components/Surfaces/Tour',
  component: Tour,
  parameters: {
    componentSubtitle: 'Step sequencer over one callout — onboarding without a library',
  },
  argTypes: {
    progressStyle: {
      control: 'select',
      options: [undefined, 'dots', 'fraction', 'none'],
      description:
        "Per-instance override of the `progressStyle` theme option: `dots`, `fraction` or `none`. A one-step tour renders no progress whatever this says.",
    },
    targetTimeout: {
      control: 'number',
      description:
        'Milliseconds a step waits for a target that is not in the DOM yet before it is skipped (default 2000). `0` skips at once.',
    },
    resolveTarget: {
      description:
        'Maps a string target to its element — `document.getElementById` when unset. Give it a `data-tour` lookup to name steps by token.',
    },
    targetMissing: {
      description: 'A step was skipped because its target never resolved: `{ key, index }`.',
    },
  },
  decorators: [
    moduleMetadata({
      imports: [UniButtonComponent, UniInputComponent, UniStackDirective],
    }),
  ],
};

export default meta;
type Story = StoryObj<StoryType>;

const STEPS: UniTourStep[] = [
  {
    key: 'welcome',
    title: 'Welcome to Projects',
    body: 'A 30-second look at the three things worth knowing.',
  },
  {
    key: 'search',
    target: 'tour-demo-search',
    title: 'Find anything',
    body: 'Type to filter projects, people, and documents. Try it — the field is live.',
  },
  {
    key: 'report',
    target: 'tour-demo-report',
    title: 'Weekly report',
    body: 'A read-only glance at the week. Reports unlock after your first ship.',
    targetInteractive: false,
  },
  {
    key: 'name',
    target: 'tour-demo-name',
    title: 'Name it',
    body: 'Type a project name to continue — Next unlocks when you do.',
    advanceOn: { event: 'input' },
  },
  {
    key: 'create',
    target: 'tour-demo-create',
    title: 'Create it',
    body: 'Click Create to finish setup — the step advances with the click.',
    advanceOn: { event: 'click' },
  },
  {
    key: 'ghost',
    target: 'tour-demo-missing',
    title: 'Never shown',
    body: 'This target does not exist; the step is skipped with a console warning.',
  },
  { key: 'done', title: 'All set', body: 'Enjoy. Press Done to wrap up.' },
];

/** The full prototype tour: dim intro, spotlights, gates, ghost step, done. */
export const Primary: Story = {
  render: () => ({
    props: { steps: STEPS },
    template: `
      <div stack-layout gap="md">
        <button text-button (click)="tour.start()">Start tour</button>
        <uni-input label="Search projects" id="tour-demo-search"></uni-input>
        <uni-input label="Weekly report" id="tour-demo-report"></uni-input>
        <uni-input label="Project name" id="tour-demo-name"></uni-input>
        <div><button text-button variant="secondary" id="tour-demo-create">Create project</button></div>
        <uni-tour #tour [steps]="steps"></uni-tour>
      </div>
    `,
  }),
};

/**
 * Targets resolve when a step presents, and a missing one is waited for.
 * The first step is click-gated on a button that renders a panel; the click
 * advances before Angular has drawn the panel, so the next step's target is
 * not there yet — the tour watches the DOM and opens on it the moment it
 * lands. Steps name their targets by `data-tour` token through
 * `resolveTarget`, and the third step's token exists nowhere, so after
 * `targetTimeout` it is reported through `targetMissing` and skipped.
 */
export const IntoNewDom: Story = {
  render: () => ({
    props: {
      open: false,
      missing: '',
      byToken: (token: string) => document.querySelector<HTMLElement>(`[data-tour="${token}"]`),
      steps: [
        {
          key: 'open',
          target: 'open-details',
          title: 'Open the details',
          body: 'Click to open the panel — the next step points inside it.',
          advanceOn: { event: 'click' },
        },
        {
          key: 'inside',
          target: 'detail-field',
          title: 'Inside the panel',
          body: 'This field did not exist when the previous step advanced.',
        },
        {
          key: 'nowhere',
          target: 'no-such-token',
          title: 'Never shown',
          body: 'No element carries this token; after the wait it is reported and skipped.',
        },
        { key: 'done', title: 'All set', body: 'Press Done to wrap up.' },
      ] satisfies UniTourStep[],
    },
    template: `
      <div stack-layout gap="md">
        <button text-button (click)="open = false; missing = ''; tour.start()">Start tour</button>
        <div><button text-button variant="secondary" data-tour="open-details" (click)="open = true">Open details</button></div>
        @if (open) {
          <uni-input label="Detail" data-tour="detail-field"></uni-input>
        }
        <p>Missing: {{ missing || 'none yet' }}</p>
        <uni-tour #tour [steps]="steps" [resolveTarget]="byToken" [targetTimeout]="1500" (targetMissing)="missing = $event.key"></uni-tour>
      </div>
    `,
  }),
};

/** Fraction progress via the theme (`tour.options.progressStyle`). */
export const FractionProgress: Story = {
  render: () => ({
    props: {
      steps: STEPS.slice(0, 2).concat(STEPS.at(-1)!),
    },
    template: `
      <div stack-layout gap="md">
        <button text-button (click)="tour.start()">Start short tour</button>
        <uni-input label="Search projects" id="tour-demo-search"></uni-input>
        <uni-tour #tour [steps]="steps"></uni-tour>
      </div>
    `,
  }),
};
