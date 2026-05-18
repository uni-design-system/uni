import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniTextComponent } from './text.component';
import type { Typeface, ColorKey } from '@uni-design-system/uni-core';

// 1. Create a unified argument type for the story file
type StoryArgs = UniTextComponent & { ngContent?: string };

// 2. Pass the combined type directly to Meta so it recognizes 'ngContent' in argTypes
const meta: Meta<StoryArgs> = {
  title: 'Components/Text',
  component: UniTextComponent as any, // Cast to any prevents the mapper from breaking on the intersection
  render: (args) => {
    const { ngContent, ...componentProps } = args;
    return {
      props: componentProps,
      template: `<uni-text ${argsToTemplate(componentProps)}>${ngContent || ''}</uni-text>`,
    };
  },
  argTypes: {
    ngContent: {
      control: 'text',
    },
  },
};

export default meta;

// 3. Keep the matching type structure on your StoryObj
type Story = StoryObj<StoryArgs>;

export const DisplayLarge: Story = {
  args: {
    ngContent: 'The quick brown fox jumps over the lazy dog.',
    color: 'primary' as ColorKey,
    typeface: 'title-large' as Typeface,
    display: 'block',
    align: 'center',
  },
};
