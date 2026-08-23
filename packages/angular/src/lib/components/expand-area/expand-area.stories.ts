import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { UniButtonComponent } from '../button/button.component';
import { UniTextDirective } from '../text/text.directive';
import { UniExpandAreaComponent as ExpandArea } from './expand-area.component';

type StoryType = ExpandArea;

const meta: Meta<StoryType> = {
  title: 'Components/Surfaces/Expand Area',
  component: ExpandArea,
  decorators: [
    moduleMetadata({
      imports: [UniTextDirective, UniButtonComponent],
    }),
  ],
  render: (args) => {
    const { title, padding, ...props } = args;
    return {
      props,
      template: `
        <uni-expand-area title="${title}" padding="${padding}" [initCollapsed]="initCollapsed" #expandArea>
          <button text-button (click)="expandArea.toggleExpand()" size="md" variant="ghost" symbolLeft="collapse_all">Collapse area</button>
        </uni-expand-area>
      `,
    };
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    title: 'Expand Area Title',
    padding: 'sm',
    initCollapsed: true,
  },
};
