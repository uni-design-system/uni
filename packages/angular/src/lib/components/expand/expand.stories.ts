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
        <uni-card-header title="Expandable Card"><uni-expand-toggle #toggle /></uni-card-header>
        <uni-expand [collapsed]="toggle.collapsed()">
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
