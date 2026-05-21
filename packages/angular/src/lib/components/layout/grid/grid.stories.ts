import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniTextComponent } from '../../text';
import { UniBoxComponent } from '../box/box.component';
import { UniGridAreaComponent } from './grid-area/grid-area.component';
import { UniGridComponent as Grid } from './grid.component';

type StoryType = Grid;

const meta: Meta<StoryType> = {
  title: 'Layout/Grid',
  component: Grid,
  decorators: [
    moduleMetadata({
      imports: [UniGridAreaComponent, UniBoxComponent, UniTextComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<StoryType>;

export const SimpleGrid: Story = {
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <div grid-layout ${argsToTemplate(props)}>
          <div box-layout gridArea="nav" color="quaternary" padding="md" borderRadius="sm">
            <Text>nav</Text>
          </div>
          <div box-layout gridArea="a1" color="primary" padding="md" borderRadius="sm">
            <Text>a1</Text>
          </div>
          <div box-layout gridArea="a2" color="secondary" padding="md" borderRadius="sm">
            <Text>a2</Text>
          </div>
          <div box-layout gridArea="b1" color="tertiary" padding="md" borderRadius="sm">
            <Text>b1</Text>
          </div>
          <div box-layout gridArea="b2" color="warn" padding="md" borderRadius="sm">
            <Text>b2</Text>
          </div>
        </div>
      `,
    };
  },
  args: {
    templateAreas: `'nav a1 a2' 'nav b1 b2'`,
    gap: 'sm',
  },
};
