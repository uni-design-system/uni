import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UniSkeletonComponent } from './skeleton.component';
import { UniCardComponent } from '../card';

type StoryType = UniSkeletonComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Feedback/Skeleton',
  component: UniSkeletonComponent,
  decorators: [moduleMetadata({ imports: [UniCardComponent] })],
  argTypes: {
    shape: {
      control: 'select',
      options: ['text', 'rect', 'circle'],
      description: "Placeholder geometry. Default: 'text'",
    },
    lines: {
      control: 'number',
      description: 'Text lines to render (text shape only). Default: 1',
    },
    width: { control: 'text', description: 'CSS width or px number.' },
    height: { control: 'text', description: 'CSS height or px number per block.' },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const TextLines: Story = {
  args: { shape: 'text', lines: 3 },
};

export const CardPlaceholder: Story = {
  render: () => ({
    template: `
      <uni-card style="max-width: 360px; display: block;">
        <div style="display: flex; gap: 12px; align-items: center; padding: 16px;">
          <uni-skeleton shape="circle" [height]="40" />
          <div style="flex: 1;">
            <uni-skeleton [lines]="2" />
          </div>
        </div>
        <uni-skeleton shape="rect" [height]="120" style="display: block; padding: 0 16px 16px;" />
      </uni-card>
    `,
  }),
};
