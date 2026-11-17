import type {
  Border,
  ColorKey,
  Radius,
  Size,
  Typeface,
  Variant,
} from '@uni-design-system/uni-core';

/** One taken sample. */
export interface UniSampledColor {
  /** sRGB `#RRGGBB`, uppercase. */
  hex: string;
  /** `screen` — the browser's own eyedropper; `image` — the loupe over a photo. */
  source: 'screen' | 'image';
  /** Which of `images` it was taken from. */
  imageIndex?: number;
  /** Where on that image, as 0–1 fractions of its width and height. */
  point?: { x: number; y: number };
}

/** Every string the sampler shows or says, for translation. */
export interface UniEyedropperLabels {
  /** The sampler dialog's title. */
  title: string;
  /** The line under the title. */
  hint: string;
  /** Accessible name of the photograph's canvas — it states the keys. */
  canvas: string;
  /** Prefix of the photo tabs: "Photo" → "Photo 1", "Photo 2". */
  photo: string;
  /** Where the reading goes, before there is one. */
  prompt: string;
  /** The button that samples anything on screen instead. */
  fromScreen: string;
  cancel: string;
  loadError: string;
  /** Lead word of the announcement: "Sampled" → "Sampled #434C5A, a dark slate blue." */
  sampled: string;
}

/**
 * Theme options for the `eyedropper` entry. The sampler's surface is the
 * `dialog` entry's; these dress the trigger, the stage and the loupe.
 */
export interface UniEyedropperOptions {
  buttonVariant?: Variant;
  buttonSize?: Size;
  /** The sampler's width, any CSS length; it never exceeds the viewport. */
  width?: string;
  /** Fill behind a photograph narrower than the stage. */
  stageColor?: ColorKey;
  stageBorderRadius?: Radius;
  /** The loupe's diameter, px. */
  loupeSize?: number;
  loupeBorder?: Border;
  hintTypeface?: Typeface;
  hintColor?: ColorKey;
}
