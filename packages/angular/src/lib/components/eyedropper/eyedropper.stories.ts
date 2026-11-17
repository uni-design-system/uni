import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UniColorSwatchComponent } from '../color-swatch/color-swatch.component';
import { UniStackDirective } from '../layout';
import { UniEyedropperComponent } from './eyedropper.component';

/** Same-origin stand-ins for photographs: a canvas can read these back. */
const photo = (colors: string[]) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">` +
      colors
        .map((color, i) => `<rect x="${i * (640 / colors.length)}" width="${640 / colors.length}" height="400" fill="${color}"/>`)
        .join('') +
      `</svg>`
  );

const IMAGES = [
  photo(['#434C5A', '#F6F6EE', '#A64B33', '#D4A373']),
  photo(['#2F2F30', '#0F4C81', '#CCC6B8']),
];

type StoryType = UniEyedropperComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Eyedropper',
  component: UniEyedropperComponent,
  decorators: [moduleMetadata({ imports: [UniColorSwatchComponent, UniStackDirective] })],
  args: { images: IMAGES, label: 'Sample a color', sampleRadius: 4, preferNative: true },
  argTypes: {
    images: {
      control: 'object',
      description:
        'Image URLs to sample from, shown in a dialog under a loupe. They must be same-origin or served with CORS headers.',
    },
    sampleRadius: {
      control: 'number',
      description: 'A sample is the mean of a (2r + 1)² pixel region. Default: 4 (9 × 9)',
    },
    preferNative: {
      control: 'boolean',
      description:
        "With no images, use the browser's own EyeDropper where it exists (Chromium desktop). Default: true",
    },
    label: { control: 'text', description: "The trigger's text — the same on both paths." },
    labels: { control: 'object', description: "Overrides for the sampler's strings." },
    disabled: { control: 'boolean', description: 'Disable the trigger.' },
    sampled: { description: 'A color was taken: { hex, source, imageIndex?, point? }' },
    canceled: { description: 'The sampler was left without taking a color.' },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const FromImages: Story = {
  render: (args) => ({
    props: { ...args, sample: null as { hex: string } | null },
    template: `
      <div stack-layout gap="md">
        <uni-eyedropper
          [images]="images"
          [label]="label"
          [sampleRadius]="sampleRadius"
          [preferNative]="preferNative"
          (sampled)="sample = $event"
        />
        @if (sample) {
          <uni-color-swatch face="tile" size="lg" name="Sampled" [hex]="sample.hex" [detail]="sample.hex" />
        }
      </div>
    `,
  }),
};

/**
 * No images: the trigger hands over to the browser's eyedropper where there
 * is one, and is disabled where there is not — there is nothing to sample.
 */
export const FromTheScreen: Story = {
  render: () => ({
    props: { sample: null as { hex: string } | null },
    template: `
      <div stack-layout gap="md">
        <uni-eyedropper label="Sample from the screen" (sampled)="sample = $event" />
        @if (sample) {
          <uni-color-swatch face="tile" size="lg" name="Sampled" [hex]="sample.hex" [detail]="sample.hex" />
        }
      </div>
    `,
  }),
};
