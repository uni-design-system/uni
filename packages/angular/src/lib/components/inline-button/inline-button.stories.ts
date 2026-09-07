import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UniInlineButtonComponent } from './inline-button.component';
import { UniButtonComponent } from '../button';
import { UniTextDirective } from '../text';

type StoryType = UniInlineButtonComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Actions/Inline Button',
  component: UniInlineButtonComponent,
  decorators: [
    // `UniButtonComponent` is here for the ghost-button comparison: without it
    // the `text-button` attribute matches no directive and the story renders a
    // bare UA button, which is not what the contrast is about.
    moduleMetadata({
      imports: [UniInlineButtonComponent, UniButtonComponent, UniTextDirective],
    }),
  ],
  argTypes: {
    iconName: { control: 'text', description: 'Theme icon token rendered beside the label.' },
    symbolName: { control: 'text', description: "Ligature fallback for glyphs the icon set lacks." },
    iconPosition: { control: 'inline-radio', options: ['start', 'end'] },
    underline: { control: 'boolean', description: 'Overrides the theme default.' },
    link: { control: 'boolean', description: "Paint with the theme's link colour." },
    disable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

/** In a real sentence, which is the only place this control makes sense. */
export const InProse: Story = {
  args: { underline: true, link: true },
  render: (args) => ({
    props: args,
    template: `
      <p uni-text="body-1-long" style="max-width: 46ch">
        Your data is processed under the terms you accepted at sign-up. You can
        <button inline-button [underline]="underline" [link]="link" [disable]="disable"
          [iconName]="iconName" [symbolName]="symbolName" [iconPosition]="iconPosition">review them</button>
        at any time, or
        <button inline-button [underline]="underline" [link]="link">export everything</button>
        as a single archive.
      </p>
    `,
  }),
};

/**
 * The reason the control exists. A `ghost` button is still a button: at its
 * default size it is a 36px `display: flex` box with 18px of horizontal
 * padding and its own type (18px Red Hat Display against the paragraph's 16px
 * Roboto). Dropped into a sentence it does not merely push the words apart —
 * it leaves the run of text altogether, taking a line of its own. The inline
 * button sits in the sentence and inherits it.
 */
export const AgainstAGhostButton: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px; max-width: 46ch">
        <p uni-text="body-1-long">
          Inline button: read the <button inline-button underline>privacy policy</button> before continuing.
        </p>
        <p uni-text="body-1-long">
          Ghost button: read the <button text-button variant="ghost">privacy policy</button> before continuing.
        </p>
      </div>
    `,
  }),
};

/** The glyph is sized in `em`, so it scales with whatever type it lands in. */
export const WithAGlyph: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px; max-width: 46ch">
        <p uni-text="body-1-long">
          Opens elsewhere:
          <button inline-button link underline iconName="externalLink" iconPosition="end">the full report</button>.
        </p>
        <p uni-text="caption">
          Same control at caption size:
          <button inline-button link underline iconName="externalLink" iconPosition="end">the full report</button>.
        </p>
        <p uni-text="headline-small">
          And in a headline:
          <button inline-button link underline iconName="externalLink" iconPosition="end">the full report</button>.
        </p>
      </div>
    `,
  }),
};

/**
 * The one thing it cannot do. Browsers blockify every `<button>` to
 * `inline-block`, so the control is an atomic inline box: the label wraps
 * *inside* it, but the run itself moves to the next line whole rather than
 * splitting where the words around it would. Short labels never notice.
 */
export const LongLabelsStayWhole: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px; max-width: 20ch">
        <p uni-text="body-1-long">
          Short label: <button inline-button underline>review terms</button> whenever you like.
        </p>
        <p uni-text="body-1-long">
          Long label: <button inline-button underline>review the terms of processing</button> whenever you like.
        </p>
      </div>
    `,
  }),
};
