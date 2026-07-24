import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UniTextComponent } from './text.component';
import { UniBoxComponent, UniStackComponent } from '../layout';

type StoryType = UniTextComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Text',
  component: UniTextComponent,
  decorators: [moduleMetadata({ imports: [UniBoxComponent, UniStackComponent] })],
  argTypes: {
    uniText: {
      control: 'text',
      description: 'Typeface via the selector attribute value, e.g. `uni-text="headline-large"`.',
    },
    typeface: {
      control: 'text',
      description: 'Explicit typeface input; the attribute value wins when both are set.',
    },
    color: { control: 'text', description: 'Color token, e.g. `on-surface-variant`.' },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const ValueShorthand: Story = {
  name: 'Value shorthand',
  render: () => ({
    template: `
      <div stack-layout gap="sm">
        <span uni-text="display-small" display="block">Display small</span>
        <span uni-text="headline-medium" display="block">Headline medium</span>
        <span uni-text="body-1-long" display="block">
          Body copy set with uni-text="body-1-long" — the attribute value is the typeface.
        </span>
        <span uni-text="caption" color="on-background-variant" display="block">
          A caption in the muted ink.
        </span>
      </div>
    `,
  }),
};

export const ElementAwareDefaults: Story = {
  name: 'Element-aware defaults',
  render: () => ({
    template: `
      <article box-layout maxWidth="640px">
        <h1 uni-text>An h1 is headline-large, free</h1>
        <h2 uni-text>An h2 is headline-medium</h2>
        <p uni-text>
          A paragraph gets body-1-long with no configuration — semantic HTML and the
          type scale reinforce each other. Explicit values always win:
        </p>
        <h2 uni-text="display-small">An h2 promoted to display-small</h2>
        <blockquote uni-text>Blockquotes read as quotes.</blockquote>
        <small uni-text>And small print is caption.</small>
      </article>
    `,
  }),
};
