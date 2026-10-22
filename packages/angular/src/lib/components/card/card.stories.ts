import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { UniCardContentComponent } from './card-content/card-content.component';
import { UniCardHeaderComponent } from './card-header/card-header.component';
import { UniCardGroupComponent } from './card-group.component';
import { UniCardComponent as Card } from './card.component';
import { UniBoxDirective, UniStackDirective } from '../layout';
import { UniTextDirective } from '../text';

type StoryType = Card & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Components/Surfaces/Card',
  component: Card,
  decorators: [
    moduleMetadata({
      imports: [
        UniCardHeaderComponent,
        UniCardContentComponent,
        UniCardGroupComponent,
        UniBoxDirective,
        UniStackDirective,
        UniTextDirective,
      ],
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

        <uni-card variant="${variant}">
          <uni-card-header title="Card Header"></uni-card-header>
          <uni-card-content>
            <span uni-text>${ngContent}</span>
          </uni-card-content>
        </uni-card>

      `,
    };
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'warn', 'ghost'],
    },
    selected: {
      control: 'boolean',
      description:
        'Paint the selected state: the `card-selected` class, and the theme\'s `selectedBorder` / `selectedColor` / `selectedElevation`. Inside a group it is derived from the group\'s value.',
    },
    interactive: {
      control: 'boolean',
      description:
        'A card the user acts on: pointer cursor, the theme\'s `hoverColor`, and `activated` on click, Space or Enter. Always on for an option in a group.',
    },
    value: { description: 'What this card stands for inside a `uni-card-group`.' },
    disabled: { control: 'boolean' },
    activated: { description: 'An interactive card was clicked or activated from the keyboard.' },
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

/**
 * States a theme can paint: `interactive` takes the pointer and the hover
 * wash and emits `activated`; `selected` wears the `selectedBorder` frame.
 * Both are classes on the frame (`card-interactive`, `card-selected`), so a
 * variant's own `&.card-selected` rule reaches them too.
 */
export const States: Story = {
  render: () => ({
    props: { picked: false },
    template: `
      <div stack-layout gap="md" [maxWidth]="320">
        <uni-card [interactive]="true" [selected]="picked" (activated)="picked = !picked">
          <uni-card-content>
            <span uni-text="title-small" display="block">Click to pick</span>
            <span uni-text="body-2-long">Selected: {{ picked }}</span>
          </uni-card-content>
        </uni-card>
        <uni-card [selected]="true">
          <uni-card-content><span uni-text="title-small">Always selected</span></uni-card-content>
        </uni-card>
      </div>
    `,
  }),
};

/**
 * Pick one: a `uni-card-group` with a `uni-card` per option. Each card with a
 * `value` is a `role="radio"`; the group is a `radiogroup` that binds with
 * `[formField]` like every other control. One tab stop, arrows move and
 * select, Space or Enter selects the focused card.
 */
export const PickOne: Story = {
  render: () => ({
    props: {
      kind: 'custom' as string | null,
      kinds: [
        { value: 'custom', title: 'Custom work', blurb: 'Built to a brief, priced on review.' },
        { value: 'catalog', title: 'Catalog order', blurb: 'Pick from a vendor line.' },
        { value: 'repair', title: 'Repair', blurb: 'An existing piece, restored.', disabled: true },
      ],
    },
    template: `
      <h3 id="kind-heading" uni-text="title-small">Kind of work</h3>
      <uni-card-group ariaLabelledBy="kind-heading" [(value)]="kind">
        @for (option of kinds; track option.value) {
          <uni-card [value]="option.value" [disabled]="option.disabled ?? false">
            <div box-layout padding="md">
              <span uni-text="title-small" display="block">{{ option.title }}</span>
              <span uni-text="body-2-long" color="on-surface-variant">{{ option.blurb }}</span>
            </div>
          </uni-card>
        }
      </uni-card-group>
      <p uni-text="body-2">Value: {{ kind ?? 'none' }}</p>
    `,
  }),
};
