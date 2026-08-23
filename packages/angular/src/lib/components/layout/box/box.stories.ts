import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { UniCardComponent } from '../../card';
import { UniTextDirective } from '../../text';
import { UniRowDirective, UniStackDirective } from '../index';
import { UniBoxDirective as Box } from './box.directive';

type StoryType = Box & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Components/Layout/Box',
  component: Box,
  tags: ['layout'],
  decorators: [
    moduleMetadata({
      imports: [
        UniTextDirective,
        UniRowDirective,
        UniStackDirective,
        UniCardComponent,
      ],
    }),
  ],
  render: (args) => {
    const { ngContent, ...props } = args;

    return {
      props,
      template: `
      <div box-layout ${argsToTemplate(props)}>
        <span uni-text>${ngContent}</span>
      </div>
      `,
    };
  },
  argTypes: {
    // Styling
    containerColor: {
      description:
        "A container color pair from the theme: the named surface plus its paired on-color. Not `color` — that name belongs to `uni-text`, which maps it to the CSS property.",
    },
    elevation: {
      description: "Applies a box shadow based on the theme's elevation levels.",
      control: {
        type: 'select',
        labels: {
          custom: 'Choose a shadow type...',
        },
      },
      options: ['raised', 'menu', 'dialog', 'warn'],
    },
    textAlign: {
      description: 'Controls the text alignment within the box.',
    },

    // Dimensions
    height: {
      description:
        "Sets the height of the box. Can be a number (pixels) or a string (e.g., '100%').",
    },
    minHeight: {
      description: 'Sets the minimum height of the box.',
    },
    maxHeight: {
      description: 'Sets the maximum height of the box.',
    },
    width: {
      description:
        "Sets the width of the box. Can be a number (pixels) or a string (e.g., '100%').",
    },
    minWidth: {
      description: 'Sets the minimum width of the box.',
    },
    maxWidth: {
      description: 'Sets the maximum width of the box.',
    },
    fullWidth: {
      description: 'When true, sets the width to 100%.',
    },
    fullHeight: {
      description: 'When true, sets the height to 100%.',
    },

    // Padding
    padding: {
      description: 'Sets padding on all sides of the box.',
    },
    paddingHorizontal: {
      description: 'Sets padding on the left and right sides.',
    },
    paddingVertical: {
      description: 'Sets padding on the top and bottom sides.',
    },
    paddingLeft: {
      description: 'Sets padding on the left side.',
    },
    paddingRight: {
      description: 'Sets padding on the right side.',
    },
    paddingTop: {
      description: 'Sets padding on the top side.',
    },
    paddingBottom: {
      description: 'Sets padding on the bottom side.',
    },

    // Border
    border: {
      description: 'Applies a themed defined border on all sides.',
    },
    dashBorder: {
      description: 'When true, applies a dashed border style.',
    },
    borderTop: {
      description: 'Applies a themed defined border to the top side.',
    },
    borderBottom: {
      description: 'Applies a themed defined border to the bottom side.',
    },
    borderLeft: {
      description: 'Applies a themed defined border to the left side.',
    },
    borderRight: {
      description: 'Applies a themed defined border to the right side.',
    },

    // Border Radius
    borderRadius: {
      description: 'Sets the border radius on all corners.',
    },
    borderRadiusLeft: {
      description: 'Sets the border radius on the left corners.',
    },
    borderRadiusRight: {
      description: 'Sets the border radius on the right corners.',
    },
    borderRadiusTop: {
      description: 'Sets the border radius on the top corners.',
    },
    borderRadiusBottom: {
      description: 'Sets the border radius on the bottom corners.',
    },

    // Flex Layout
    display: {
      description: 'Sets the display property (flex, block, etc.).',
    },
    flexDirection: {
      description: 'Sets the direction of flex items.',
    },
    alignSelf: {
      description: 'Controls how the box aligns itself within its container.',
    },
    alignItems: {
      description: 'Controls how items are aligned within the box.',
    },
    alignContent: {
      description: "Controls alignment of lines when there's extra space in the cross-axis.",
    },
    justifyContent: {
      description: 'Controls alignment of items along the main axis.',
    },
    flex: {
      description:
        'The `flex` shorthand. `[flex]="1"` is `flex: 1` — grow, shrink and a zero basis — which `grow` alone cannot express.',
    },
    shrink: { description: 'Sets flex-shrink. `0` keeps the box from shrinking.' },
    basis: { description: 'Sets flex-basis. Number = px via binding; string = CSS length.' },
    marginInline: {
      description:
        'Inline-axis margin. `"auto"` centers a maxWidth container; otherwise a spacing token.',
    },
    grow: {
      description:
        'Sets the flex grow factor, determining how much the box will grow relative to other flex items.',
    },
    wrapItems: {
      description: 'Controls whether flex items wrap onto multiple lines.',
    },
    gap: {
      description: 'Sets the gap between flex or grid items.',
    },

    // Grid Layout
    gridArea: {
      description: 'Specifies the grid area the box should occupy.',
    },
    gridColumn: {
      description: 'Specifies which column(s) the box should occupy.',
    },
    gridRow: {
      description: 'Specifies which row(s) the box should occupy.',
    },

    // Other
    overflow: {
      description: 'Controls how content that overflows the box is handled.',
    },
    ignoreDir: {
      description: 'When true (default), automatically reverses flex direction in RTL mode.',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    containerColor: 'secondary-container',
    borderRadius: 'md',
    padding: 'lg',
    ngContent: 'Box Content.',
  },
};

/** `flex: 1` shares space evenly; `grow` alone leaves flex-basis auto. */
export const FlexChildren: Story = {
  name: 'Flex children',
  render: () => ({
    template: `
      <div row-layout gap="md" uni-text="body-2-short">
        <div box-layout [flex]="1" containerColor="primary-container" padding="md" borderRadius="xs">
          flex 1 — a much longer label than its sibling
        </div>
        <div box-layout [flex]="1" containerColor="primary-container" padding="md" borderRadius="xs">
          flex 1
        </div>
        <div box-layout [shrink]="0" [basis]="120" containerColor="secondary-container" padding="md" borderRadius="xs">
          fixed 120
        </div>
      </div>
    `,
  }),
};

/** The page-shell recipe: a max-width container centered on the inline axis. */
export const CenteredPageShell: Story = {
  name: 'Centered page shell',
  render: () => ({
    template: `
      <div box-layout containerColor="surface" padding="md">
        <main box-layout maxWidth="480px" marginInline="auto" padding="lg"
              containerColor="primary-container" borderRadius="sm" textAlign="center" uni-text="body-1-long">
          maxWidth + marginInline="auto"
        </main>
      </div>
    `,
  }),
};

/**
 * A layout attribute and `uni-text` on one element, and a layout attribute on a
 * component's own host — both impossible while these were components.
 */
export const Composition: Story = {
  render: () => ({
    template: `
      <div stack-layout gap="md">
        <div row-layout uni-text="title-large" gap="sm" padding="md"
             containerColor="primary-container" borderRadius="xs">
          row-layout + uni-text on one element
        </div>
        <uni-card box-layout padding="lg">uni-card + box-layout on one element</uni-card>
      </div>
    `,
  }),
};
