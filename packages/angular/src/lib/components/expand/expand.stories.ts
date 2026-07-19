import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniTextComponent } from '../';
import {
  UniCardComponent,
  UniCardContentComponent,
  UniCardHeaderComponent,
} from '../card';
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
      <Card>
        <CardHeader title="Expandable Card"><ExpandToggle #toggle /></CardHeader>
        <Expand [collapsed]="toggle.collapsed()">
          <CardContent>
            <Text>${ngContent}</Text>
          </CardContent>
        </Expand>
      </Card>
      `,
    };
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    collapsed: false,
    ngContent: 'Expandable Content',
  },
};
