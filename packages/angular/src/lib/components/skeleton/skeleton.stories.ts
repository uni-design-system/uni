import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UniSkeletonComponent } from './skeleton.component';
import { UniCardComponent } from '../card';
import { UniBoxComponent, UniRowComponent } from '../layout';

type StoryType = UniSkeletonComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Feedback/Skeleton',
  component: UniSkeletonComponent,
  decorators: [moduleMetadata({ imports: [UniRowComponent, UniBoxComponent, UniCardComponent] })],
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
      <div box-layout maxWidth="360px">
        <uni-card>
          <div row-layout gap="sm" alignItems="center" padding="md">
            <uni-skeleton shape="circle" [height]="40" />
            <div box-layout [grow]="1">
              <uni-skeleton [lines]="2" />
            </div>
          </div>
          <div box-layout paddingHorizontal="md" paddingBottom="md">
            <uni-skeleton shape="rect" [height]="120" />
          </div>
        </uni-card>
      </div>
    `,
  }),
};
