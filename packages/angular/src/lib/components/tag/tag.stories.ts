import { Meta, StoryObj } from '@storybook/angular';
import { UniTagComponent } from './tag.component';

const meta: Meta<UniTagComponent> = {
  title: 'Components/Tag',
  component: UniTagComponent,
  argTypes: {
    // Input properties
    label: {
      description: 'The text content to be displayed within the tag',
      control: 'text',
      type: { name: 'string', required: true },
    },
    value: {
      description:
        'A unique identifier or value associated with the tag, used when handling close events',
      control: 'text',
      type: {
        name: 'union',
        value: [{ name: 'string' }, { name: 'number' }],
      },
    },
    // Output properties
    close: {
      description:
        "Event emitted when the tag's close button is clicked, emits the tag's value",
      control: false,
      table: {
        type: { summary: 'event' },
      },
    },
  },
  args: {
    label: 'Sample Tag',
    value: '1',
  },
  parameters: {
    componentSubtitle:
      'A compact component for displaying deletable labels or categories',
    docs: {
      description: {
        component: `
The Tag component is used to display labels, categories, or metadata in a compact form.
Each tag can be removed via a close button, making it ideal for displaying selected filters,
applied categories, or other removable items.

## Features
- Compact, pill-shaped design
- Built-in close button
- Supports both string and numeric values
- Emits close events with associated values
- Integrates with the design system's theme

## Usage Guidelines
- Use tags for displaying selected filters or categories
- Each tag should have a unique value for identification
- Keep label text concise and clear
- Handle close events to manage tag removal
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<UniTagComponent>;

export const Primary: Story = {
  args: {
    label: 'Primary Tag',
    value: '1',
  },
};

export const NumericValue: Story = {
  args: {
    label: 'Numeric Tag',
    value: 42,
  },
};

export const LongLabel: Story = {
  args: {
    label: 'This is a very long tag label that might need truncation',
    value: 'long',
  },
};

export const WithoutValue: Story = {
  args: {
    label: 'Tag without value',
  },
};
