import { Meta, StoryObj } from '@storybook/angular';
import { UniSymbolComponent as Symbol } from './symbol.component';

type StoryType = Symbol;

const meta: Meta<StoryType> = {
  title: 'Components/Symbol',
  component: Symbol,
  argTypes: {
    name: { description: '' },
    fill: {
      description:
        'Fill gives you the ability to modify the default icon style. A single icon can render both unfilled and filled states.\n',
    },
    grade: {
      description:
        "Weight and grade affect a symbol's thickness. Adjustments to grade are more granular than adjustments to weight and have a small impact on the size of the symbol.\n",
    },
    opticalSize: {
      description:
        'Optical Sizes range from 20dp to 48dp.\n' +
        '\n' +
        'For the image to look the same at different sizes, the stroke weight (thickness) changes as the icon size scales. Optical Size offers a way to automatically adjust the stroke weight when you increase or decrease the symbol size.',
      control: { type: 'range', min: 20, max: 48 },
    },
    weight: {
      description:
        "Weight defines the symbol's stroke weight, with a range of weights between thin (100) and bold (700). Weight can also affect the overall size of the symbol.\n",
      control: { type: 'range', min: 100, max: 700, step: 100 },
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    name: 'settings',
  },
};
