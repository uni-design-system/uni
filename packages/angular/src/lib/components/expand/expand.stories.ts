import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniTextComponent } from '../';
import { UniCardComponent, UniCardContentComponent, UniCardHeaderComponent } from '../card';
import { UniExpandToggleComponent } from '../expand-toggle/expand-toggle.component';
import { UniExpandComponent as Expand } from './expand.component';

type StoryType = Expand & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Components/Expand',
  component: Expand,
  decorators: [
    moduleMetadata({
      imports: [
        UniExpandToggleComponent,
        UniTextComponent,
        UniCardComponent,
        UniCardHeaderComponent,
        UniCardContentComponent,
      ],
    }),
  ],
  render: (args) => {
    const { ngContent, ...props } = args;
    return {
      props,
      template: `
      <uni-card>
        <uni-card-header title="Expandable Card"><uni-expand-toggle #toggle [transitionSpeed]="expand.duration()" /></uni-card-header>
        <uni-expand #expand [collapsed]="toggle.collapsed()" [transitionSpeed]="transitionSpeed">
          <uni-card-content>
            <span uni-text>${ngContent}</span>
          </uni-card-content>
        </uni-expand>
      </uni-card>
      `,
    };
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    ngContent: 'Expandable Content',
  },
};

/**
 * Exact per-instance duration. Overrides the `expand` theme options'
 * `transitionSpeed` and bypasses size-aware scaling.
 */
export const Snappy: Story = {
  args: {
    ngContent: 'Reveals in exactly 150ms, regardless of content height.',
    transitionSpeed: 0.15,
  },
};

/**
 * Duration scales with content height (√-of-height, clamped), so this tall
 * region takes longer than Primary's single line — perceived speed stays
 * steady instead of tall content rushing past.
 */
export const Tall: Story = {
  args: {
    ngContent: Array.from(
      { length: 12 },
      (_, i) => `Row ${i + 1} of a tall reveal, timed to its height.`,
    ).join('<br>'),
  },
};
