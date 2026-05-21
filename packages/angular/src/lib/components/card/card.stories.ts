import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { UniCardContentComponent } from './card-content/card-content.component';
import { UniCardHeaderComponent } from './card-header/card-header.component';
import { UniCardComponent as Card } from './card.component';
import { UniTextComponent } from '../text';

type StoryType = Card & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Components/Card',
  component: Card,
  decorators: [
    moduleMetadata({
      imports: [UniCardHeaderComponent, UniCardContentComponent, UniTextComponent],
    }),
    applicationConfig({
      providers: [],
    }),
  ],
  render: (args) => {
    const { ngContent, variant, ...props } = args;
    return {
      props,
      template: `

        <Card variant="${variant}">
          <CardHeader title="Card Header"></CardHeader>
          <CardContent>
            <Text>${ngContent}</Text>
          </CardContent>
        </Card>

      `,
    };
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'warn', 'ghost'],
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    ngContent: 'Card content.',
  },
};
