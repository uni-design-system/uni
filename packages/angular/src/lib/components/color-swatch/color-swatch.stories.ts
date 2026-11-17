import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UniRowDirective, UniStackDirective } from '../layout';
import { UniTextDirective } from '../text/text.directive';
import { UniColorSwatchComponent } from './color-swatch.component';

type StoryType = UniColorSwatchComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Data Display/Color Swatch',
  component: UniColorSwatchComponent,
  decorators: [
    moduleMetadata({ imports: [UniRowDirective, UniStackDirective, UniTextDirective] }),
  ],
  argTypes: {
    hex: {
      control: 'text',
      description:
        'The color: #434C5A, 434c5a or rgb(67, 76, 90). Absent or unreadable renders the empty block.',
    },
    name: { control: 'text', description: 'What the color is called.' },
    detail: {
      control: 'text',
      description: 'Secondary text: after the name on chip, the line under it on tile.',
    },
    caption: {
      control: 'text',
      description: 'A small third line, e.g. where the color came from.',
    },
    face: {
      control: 'select',
      options: ['chip', 'tile', 'card', 'dot'],
      description:
        'chip: block + one line. tile: block + two lines. card: the block alone, filling its container. dot: the block alone, round — requires ariaLabel. Default: chip',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: "The block's edge from the theme's colorSwatch.sizes (14 / 22 / 40 / 72px). Default: md",
    },
    ariaLabel: {
      control: 'text',
      description:
        'Accessible name for the text-less faces: required for dot, an override of the derived name for card.',
    },
    emptyLabel: {
      control: 'text',
      description: 'Shown and read when no hex, name or detail is given.',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Chip: Story = {
  args: {
    hex: '#434C5A',
    name: 'Hale Navy',
    detail: 'HC-154 · Benjamin Moore',
    face: 'chip',
    size: 'md',
  },
};

/** The border is the guarantee: a near-white and a near-black both read as swatches. */
export const Faces: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="md">
        <uni-color-swatch hex="#434C5A" name="Hale Navy" detail="HC-154 · Benjamin Moore" face="chip" />
        <uni-color-swatch hex="#F6F6EE" name="Chantilly Lace" detail="OC-65 · Benjamin Moore" face="tile" size="lg" />
        <uni-color-swatch hex="#2F2F30" name="Tricorn Black" detail="SW 6258 · Sherwin-Williams" caption="Sampled" face="tile" size="xl" />
        <div row-layout gap="sm" alignItems="center">
          <uni-color-swatch hex="#434C5A" face="dot" ariaLabel="Hale Navy" />
          <uni-color-swatch hex="#F6F6EE" face="dot" ariaLabel="Chantilly Lace" />
          <uni-color-swatch hex="#2F2F30" face="dot" ariaLabel="Tricorn Black" />
        </div>
      </div>
    `,
  }),
};

/**
 * `card` is an image area: the host sizes the box, the swatch fills it, and
 * the consumer draws the caption — which is why the face itself is text-free.
 */
export const Card: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="xs" style="width: 220px">
        <div style="aspect-ratio: 4 / 3; border-radius: 8px; overflow: hidden">
          <uni-color-swatch hex="#434C5A" name="Hale Navy" detail="HC-154 · Benjamin Moore" face="card" />
        </div>
        <span uni-text="title-small">Hale Navy</span>
        <span uni-text="caption">HC-154 · Benjamin Moore</span>
      </div>
    `,
  }),
};

/** No hex is a state, not an error: a color can be named before it is matched. */
export const Empty: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="md">
        <uni-color-swatch name="Hague Blue" detail="No. 30 · Farrow & Ball" face="tile" size="lg" />
        <uni-color-swatch face="tile" size="lg" />
      </div>
    `,
  }),
};
