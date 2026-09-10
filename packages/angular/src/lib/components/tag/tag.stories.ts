import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniBoxDirective, UniRowDirective } from '../layout';
import { UniTagComponent } from './tag.component';

const meta: Meta<UniTagComponent> = {
  title: 'Components/Data Display/Tag',
  component: UniTagComponent,
  decorators: [moduleMetadata({ imports: [UniBoxDirective, UniRowDirective] })],
  args: { label: 'Design', value: 'design' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'warn', 'success', 'ghost', 'disabled'],
      description: 'Colour role, resolved from the theme’s `tag` variants.',
    },
    tone: {
      control: 'inline-radio',
      options: ['soft', 'solid', 'outline'],
      description: 'Style archetype, orthogonal to the colour role.',
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    componentSubtitle: 'Compact chip for categories, states, filters and tokens',
  },
};

export default meta;
type Story = StoryObj<UniTagComponent>;

export const Primary: Story = {};

/** The two style axes: colour role across the top, tone down the side. */
export const VariantsAndTones: Story = {
  render: () => ({
    template: `
      <div box-layout gap="sm">
        @for (tone of ['soft', 'solid', 'outline']; track tone) {
          <div row-layout gap="sm" alignItems="center" style="margin-bottom:8px">
            @for (variant of ['primary', 'secondary', 'tertiary', 'warn', 'success', 'ghost']; track variant) {
              <uni-tag [variant]="variant" [tone]="tone" [label]="variant" />
            }
          </div>
        }
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div row-layout gap="sm" alignItems="center">
        <uni-tag size="sm" label="Small" />
        <uni-tag size="md" label="Medium" />
        <uni-tag size="lg" label="Large" />
      </div>
    `,
  }),
};

/** Removal is opt-in — a category label ships no dead control. */
export const Removable: Story = {
  args: { removable: true },
};

/** An interactive chip's body is a button; the remove control stays a sibling. */
export const Interactive: Story = {
  args: { interactive: true, removable: true, selected: false },
};

/**
 * Selection paints itself: the theme's `&.tag-selected` rules promote the chip
 * to its role's solid pair, so an app binds `selected` and nothing else. Before,
 * `selected` set only `aria-pressed`, and every chip in app markup carried a
 * `[tone]="on() ? 'solid' : 'soft'"` of its own.
 */
export const Selected: Story = {
  args: { interactive: true, selected: true },
};

/**
 * A toggle row. Click through it: the chips hold the check's place while
 * unselected, so picking one never reflows the row — and each label stays
 * centred between its tucked ends.
 */
export const Toggles: Story = {
  render: () => ({
    template: `
      <div row-layout gap="sm" alignItems="center" style="flex-wrap:wrap">
        @for (facet of ['Design', 'Engineering', 'Legal', 'Finance']; track facet) {
          <uni-tag
            [interactive]="true"
            [label]="facet"
            [selected]="picked.includes(facet)"
            (activated)="toggle(facet)"
          />
        }
      </div>
    `,
    props: {
      picked: ['Engineering'],
      toggle(facet: string) {
        const self = this as unknown as { picked: string[] };
        self.picked = self.picked.includes(facet)
          ? self.picked.filter((value) => value !== facet)
          : [...self.picked, facet];
      },
    },
  }),
};

/** Lead slot: avatar, initials fallback, symbol, or status dot. */
export const LeadElements: Story = {
  render: () => ({
    template: `
      <div row-layout gap="sm" alignItems="center">
        <uni-tag label="Alice Chen" avatarName="Alice Chen" removable="true" />
        <uni-tag label="Starred" iconName="star" />
        <uni-tag label="Live" [dot]="true" variant="success" />
        <uni-tag label="Custom lead">
          <span tag-lead aria-hidden="true">🎨</span>
        </uni-tag>
      </div>
    `,
  }),
};

/** Invalid entries stay visible and fixable, with a non-colour cue. */
export const Invalid: Story = {
  args: { label: 'nope@@x', invalid: true, removable: true, variant: 'warn' },
};

export const Disabled: Story = {
  args: { label: 'Locked', disabled: true, removable: true },
};

/** A truncation budget keeps one long token from dominating the row. */
export const Truncated: Story = {
  args: {
    label: 'A very long tag label that has to be truncated somewhere',
    maxWidth: '18ch',
    removable: true,
  },
};
