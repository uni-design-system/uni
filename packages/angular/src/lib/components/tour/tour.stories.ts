import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button/button.component';
import { UniInputComponent } from '../input/input.component';
import { UniStackComponent } from '../layout';
import type { UniTourStep } from './tour.model';
import { UniTourComponent as Tour } from './tour.component';

type StoryType = Tour;

const meta: Meta<StoryType> = {
  title: 'Components/Surfaces/Tour',
  component: Tour,
  parameters: {
    componentSubtitle: 'Step sequencer over one callout — onboarding without a library',
  },
  decorators: [
    moduleMetadata({
      imports: [UniButtonComponent, UniInputComponent, UniStackComponent],
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

/** Fraction progress via the theme (\`tour.options.progressStyle\`). */
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
