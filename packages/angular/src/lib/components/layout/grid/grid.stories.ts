import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniTextDirective } from '../../text';
import { UniBoxDirective } from '../box/box.directive';
import { UniGridAreaDirective } from './grid-area/grid-area.directive';
import { UniGridDirective as Grid } from './grid.directive';

type StoryType = Grid;

const meta: Meta<StoryType> = {
  title: 'Components/Layout/Grid',
  component: Grid,
  decorators: [
    moduleMetadata({
      imports: [UniGridAreaDirective, UniBoxDirective, UniTextDirective],
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
            <span uni-text>nav</span>
          </div>
          <div box-layout gridArea="a1" color="primary" padding="md" borderRadius="sm">
            <span uni-text>a1</span>
          </div>
          <div box-layout gridArea="a2" color="secondary" padding="md" borderRadius="sm">
            <span uni-text>a2</span>
          </div>
          <div box-layout gridArea="b1" color="tertiary" padding="md" borderRadius="sm">
            <span uni-text>b1</span>
          </div>
          <div box-layout gridArea="b2" color="warn" padding="md" borderRadius="sm">
            <span uni-text>b2</span>
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
