import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { UniButtonComponent } from '../button/button.component';
import { UniTextComponent } from '../text/text.component';
import { UniExpandAreaComponent as ExpandArea } from './expand-area.component';

type StoryType = ExpandArea;

const meta: Meta<StoryType> = {
  title: 'Components/Expand Area',
  component: ExpandArea,
  decorators: [
    moduleMetadata({
      imports: [UniTextComponent, UniButtonComponent],
    }),
  ],
  render: (args) => {
    const { title, padding, initCollapsed, ...props } = args;
    return {
      props,
      template: `
        <ExpandArea title="${title}" padding="${padding}" initCollapsed="${initCollapsed}" #expandArea>
          <button text-button (click)="expandArea.toggleExpand()" size="md" variant="ghost" symbolLeft="collapse_all">Collapse area</button>
        </ExpandArea>
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
