import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UniDrawerComponent } from './drawer.component';
import { UniAppBarComponent } from '../app-bar';
import { UniButtonComponent } from '../button';
import { UniIconButtonComponent } from '../icon-button';
import { UniBoxComponent, UniRowComponent, UniStackComponent } from '../layout';
import { UniTextComponent } from '../text';

type StoryType = UniDrawerComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Navigation/Drawer',
  component: UniDrawerComponent,
  decorators: [
    moduleMetadata({
      imports: [
        UniAppBarComponent,
        UniButtonComponent,
        UniIconButtonComponent,
        UniBoxComponent,
        UniRowComponent,
        UniStackComponent,
        UniTextComponent,
      ],
    }),
  ],
  argTypes: {
    mode: {
      control: 'select',
      options: ['side', 'over'],
      description: "'side' pushes content in-flow; 'over' floats with a scrim. Default: 'side'",
    },
    position: {
      control: 'select',
      options: ['start', 'end'],
      description: "Edge the drawer attaches to. Default: 'start'",
    },
    open: { control: 'boolean', description: 'Two-way bindable open state.' },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

/** The dashboard shell recipe: app bar + side drawer + content. */
export const DashboardShell: Story = {
  render: () => ({
    props: { open: true },
    template: `
      <section stack-layout height="420px" overflow="hidden">
        <uni-app-bar title="Console">
          <button leading icon-button symbolName="menu" (click)="open = !open">Toggle navigation</button>
          <button trailing icon-button symbolName="account_circle">Account</button>
        </uni-app-bar>
        <div row-layout [grow]="1" [minHeight]="0">
          <uni-drawer mode="side" [(open)]="open">
            <nav stack-layout gap="sm" aria-label="Main">
              <uni-text typeface="title-small" display="block">Dashboard</uni-text>
              <uni-text typeface="title-small" display="block">Reports</uni-text>
              <uni-text typeface="title-small" display="block">Settings</uni-text>
            </nav>
          </uni-drawer>
          <main box-layout [grow]="1" padding="md" [minWidth]="0">
            <uni-text typeface="headline-small">Content</uni-text>
            <uni-text typeface="body-1-long" display="block">
              The side drawer pushes this content; toggle it from the app bar.
            </uni-text>
          </main>
        </div>
      </section>
    `,
  }),
};

export const Overlay: Story = {
  render: () => ({
    props: { open: false },
    template: `
      <button text-button variant="primary" size="md" (click)="open = true">Open drawer</button>
      <uni-drawer mode="over" position="start" [(open)]="open" ariaLabel="Main navigation">
        <uni-text typeface="title-small" display="block">Dashboard</uni-text>
        <uni-text typeface="title-small" display="block">Reports</uni-text>
        <uni-text typeface="title-small" display="block">Settings</uni-text>
        <button text-button variant="secondary" size="sm" (click)="open = false">Close</button>
      </uni-drawer>
    `,
  }),
};
