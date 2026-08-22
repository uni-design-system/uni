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
    color: { control: 'text', description: 'Base color token. Defaults to the theme option.' },
    highlightColor: {
      control: 'text',
      description: 'Shimmer highlight token. Defaults to the theme option.',
    },
    borderRadius: {
      control: 'text',
      description: 'Radius token. Defaults to the theme option; circles stay round.',
    },
    label: {
      control: 'text',
      description: 'Announces the skeleton as a polite status. Unset leaves it aria-hidden.',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const TextLines: Story = {
  args: { shape: 'text', lines: 3 },
};

/**
 * One app needs more than one skeleton look: the pill chip wants `max`, the
 * bars want the theme default, and a placeholder sitting on the page
 * background wants a different tint than one on a card.
 */
export const PerInstanceTokens: Story = {
  render: () => ({
    template: `
      <div box-layout maxWidth="360px" gap="md">
        <uni-card>
          <div box-layout padding="md" gap="sm">
            <div row-layout gap="sm" alignItems="center">
              <uni-skeleton shape="rect" borderRadius="max" [width]="56" [height]="20" />
              <uni-skeleton shape="rect" [width]="120" [height]="12" />
            </div>
            <uni-skeleton [lines]="2" />
          </div>
        </uni-card>
        <uni-skeleton color="surface" highlightColor="surface-variant" [lines]="2" />
      </div>
    `,
  }),
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
