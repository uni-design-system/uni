import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { css } from '@emotion/css';
import { meanColor, nameHue, normalizeHex } from '@uni-design-system/uni-core';
import { createAnnouncer, visuallyHidden } from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniButtonComponent } from '../button/button.component';
import { UniColorSwatchComponent } from '../color-swatch/color-swatch.component';
import { UniDialogHeaderComponent } from '../dialog/dialog-header/dialog-header.component';
import { UniDialogComponent } from '../dialog/dialog.component';
import type {
  UniEyedropperLabels,
  UniEyedropperOptions,
  UniSampledColor,
} from './eyedropper.model';

const LABELS: UniEyedropperLabels = {
  title: 'Sample a color',
  hint: 'Tap the color in the photo. The sample is the mean of the region under the loupe, never one pixel.',
  canvas:
    'Photograph. Arrow keys move the sample point, Shift moves it faster, Enter takes the color, Escape closes.',
  photo: 'Photo',
  prompt: 'Move over the photo, or use the arrow keys.',
  fromScreen: 'From the screen',
  cancel: 'Cancel',
  loadError: "This photo couldn't be loaded for sampling.",
  sampled: 'Sampled',
};

interface NativeEyeDropper {
  open(): Promise<{ sRGBHex: string }>;
}

/** The browser's own eyedropper (Chromium desktop), detected and never assumed. */
function nativeEyeDropper(): (new () => NativeEyeDropper) | null {
  if (typeof window === 'undefined' || !('EyeDropper' in window)) return null;
  return (window as unknown as { EyeDropper: new () => NativeEyeDropper }).EyeDropper;
}

/** A photograph is decoded once, no larger than this on its long edge. */
const MAX_EDGE = 1600;

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    // Without CORS approval the canvas is tainted and cannot be read back.
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('image'));
    image.src = src;
  });
}

/**
 * Samples a color: from the app's own images through a loupe, or from
 * anything on screen where the browser has an eyedropper of its own.
 *
 * One trigger, two paths, and the trigger's label does not change between
 * them. With `images`, it opens a dialog over the photograph — pointer or
 * arrow keys move the sample point, a click or Enter takes it. With none, it
 * hands over to the native `EyeDropper` where there is one (Chromium
 * desktop); where there is not, the trigger is disabled, because there is
 * nothing to sample. With both, the dialog offers the screen as well.
 *
 * A sample is the **mean of a region** — `(2 × sampleRadius + 1)²` pixels —
 * because one pixel of a photographed chip is noise. The result is announced
 * by hue ("Sampled #434C5A, a dark slate blue."), so a screen-reader user
 * hears more than six characters.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-eyedropper, Eyedropper',
  imports: [
    UniButtonComponent,
    UniColorSwatchComponent,
    UniDialogComponent,
    UniDialogHeaderComponent,
  ],
  templateUrl: './eyedropper.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'eyedropper' }],
  host: { '[class]': 'className' },
})
export class UniEyedropperComponent extends BaseComponent<UniEyedropperOptions> {
  /** Image URLs to sample from. They must be CORS-readable (see the docs). */
  images = input<readonly string[]>([]);

  /** A sample is the mean of a `(2r + 1)²` region: 4 → 9 × 9 px. */
  sampleRadius = input(4);

  /** With no `images`, hand over to the browser's `EyeDropper` when it has one. */
  preferNative = input(true, { transform: booleanAttribute });

  /** The trigger's text — the same on both paths. */
  label = input('Sample a color');

  /** Overrides for any of the sampler's strings. */
  labels = input<Partial<UniEyedropperLabels>>({});

  disabled = input(false, { transform: booleanAttribute });

  sampled = output<UniSampledColor>();
  /** The sampler was left without taking a color. */
  canceled = output<void>();

  protected readonly nativeAvailable = !!nativeEyeDropper();
  protected readonly open = signal(false);
  protected readonly index = signal(0);
  /** The mean under the pointer or the keyboard point. */
  protected readonly reading = signal<string | null>(null);
  protected readonly loupe = signal<{ left: number; top: number } | null>(null);
  protected readonly loadError = signal(false);
  protected readonly announcer = createAnnouncer();
  protected readonly srOnly = css(visuallyHidden);

  /** Canvas pixels. */
  private point = { x: 0, y: 0 };
  /** The photograph is on the canvas — until then there is nothing to read. */
  private ready = false;
  private took = false;
  private frame = 0;

  private readonly photo = viewChild.required<ElementRef<HTMLCanvasElement>>('photo');
  private readonly loupeCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('loupeCanvas');

  protected readonly text = computed<UniEyedropperLabels>(() => ({ ...LABELS, ...this.labels() }));
  protected readonly hasImages = computed(() => this.images().length > 0);
  protected readonly canSample = computed(
    () => this.hasImages() || (this.nativeAvailable && this.preferNative())
  );
  protected readonly readingHue = computed(() => nameHue(this.reading()));

  constructor() {
    super();

    // Draw the chosen photograph when the sampler opens, and on a tab change.
    effect(() => {
      const src = this.images()[this.index()];
      if (!this.open() || !src) return;
      untracked(() => void this.draw(src));
    });

    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));
  }

  /** The trigger: the photos when there are any, the screen otherwise. */
  start(): void {
    if (this.disabled()) return;
    if (this.hasImages()) this.openSampler();
    else if (this.nativeAvailable && this.preferNative()) void this.fromScreen();
  }

  private openSampler(): void {
    this.took = false;
    this.ready = false;
    this.reading.set(null);
    this.loupe.set(null);
    this.loadError.set(false);
    this.index.update((index) => clamp(index, 0, this.images().length - 1));
    this.open.set(true);
  }

  /** The dialog closed itself (Escape, its ✕) or was told to. */
  protected onShowChange(showing: boolean): void {
    if (!showing) this.cancel();
  }

  /** Leave the sampler. A no-op once it is closed, however it was closed. */
  protected cancel(): void {
    if (!this.open()) return;
    this.open.set(false);
    if (!this.took) this.canceled.emit();
  }

  protected pick(index: number): void {
    this.ready = false;
    this.index.set(index);
    this.reading.set(null);
    this.loupe.set(null);
  }

  /** The native path: anything on screen, one result. */
  async fromScreen(): Promise<void> {
    const EyeDropper = nativeEyeDropper();
    if (!EyeDropper) return;
    // The sampler would cover what the user wants to sample.
    this.took = true;
    this.open.set(false);
    try {
      const hex = normalizeHex((await new EyeDropper().open()).sRGBHex);
      if (hex) this.emit({ hex, source: 'screen' });
      else this.canceled.emit();
    } catch {
      this.canceled.emit(); // Escape, or a click that sampled nothing
    }
  }

  private emit(sample: UniSampledColor): void {
    this.sampled.emit(sample);
    this.announcer.announce(`${this.text().sampled} ${sample.hex}, ${nameHue(sample.hex)}.`);
  }

  private async draw(src: string): Promise<void> {
    const canvas = this.photo().nativeElement;
    this.loadError.set(false);
    try {
      const image = await loadImage(src);
      if (src !== this.images()[this.index()]) return; // a later tab won the race
      const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('canvas');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      this.point = { x: Math.floor(canvas.width / 2), y: Math.floor(canvas.height / 2) };
      this.ready = true;
      // The dialog focused the canvas before the photograph landed: read the
      // center now, rather than leaving an empty canvas's black as the reading.
      if (document.activeElement === canvas) this.show(this.point.x, this.point.y);
    } catch {
      this.ready = false;
      this.loadError.set(true);
    }
  }

  private toCanvas(event: { clientX: number; clientY: number }): { x: number; y: number } {
    const canvas = this.photo().nativeElement;
    const box = canvas.getBoundingClientRect();
    const scale = (value: number, shown: number, real: number) =>
      shown ? clamp(Math.round((value * real) / shown), 0, real - 1) : 0;
    return {
      x: scale(event.clientX - box.left, box.width, canvas.width),
      y: scale(event.clientY - box.top, box.height, canvas.height),
    };
  }

  /** The mean of the region around (x, y); also paints the region into the loupe. */
  private meanAt(x: number, y: number): string | null {
    if (!this.ready) return null;
    const canvas = this.photo().nativeElement;
    const radius = Math.max(0, Math.round(this.sampleRadius()));
    const left = Math.max(0, x - radius);
    const top = Math.max(0, y - radius);
    const width = Math.min(canvas.width - left, 2 * radius + 1);
    const height = Math.min(canvas.height - top, 2 * radius + 1);
    if (width <= 0 || height <= 0) return null;
    try {
      const region = canvas
        .getContext('2d', { willReadFrequently: true })
        ?.getImageData(left, top, width, height);
      if (!region) return null;
      const loupe = this.loupeCanvas().nativeElement;
      loupe.width = width;
      loupe.height = height;
      loupe.getContext('2d')?.putImageData(region, 0, 0);
      return meanColor(region.data);
    } catch {
      // A tainted canvas: the image loaded but its host did not allow reading.
      this.ready = false;
      this.loadError.set(true);
      return null;
    }
  }

  private show(x: number, y: number): void {
    this.point = { x, y };
    const hex = this.meanAt(x, y);
    if (!hex) return;
    const canvas = this.photo().nativeElement;
    const box = canvas.getBoundingClientRect();
    this.loupe.set({
      left: (x * box.width) / canvas.width,
      top: (y * box.height) / canvas.height,
    });
    this.reading.set(hex);
  }

  private take(x: number, y: number): void {
    const hex = this.meanAt(x, y);
    if (!hex) return;
    const canvas = this.photo().nativeElement;
    this.took = true;
    this.open.set(false);
    this.emit({
      hex,
      source: 'image',
      imageIndex: this.index(),
      point: { x: x / canvas.width, y: y / canvas.height },
    });
  }

  protected onPointerMove(event: PointerEvent): void {
    // One read per frame, whatever the pointer does.
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      const { x, y } = this.toCanvas(event);
      this.show(x, y);
    });
  }

  protected onClick(event: MouseEvent): void {
    const { x, y } = this.toCanvas(event);
    this.take(x, y);
  }

  protected onFocus(): void {
    this.show(this.point.x, this.point.y);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const canvas = this.photo().nativeElement;
    const step = event.shiftKey ? 10 : 1;
    const { x, y } = this.point;
    switch (event.key) {
      case 'ArrowLeft':
        this.show(Math.max(0, x - step), y);
        break;
      case 'ArrowRight':
        this.show(Math.min(canvas.width - 1, x + step), y);
        break;
      case 'ArrowUp':
        this.show(x, Math.max(0, y - step));
        break;
      case 'ArrowDown':
        this.show(x, Math.min(canvas.height - 1, y + step));
        break;
      case 'Enter':
        this.take(x, y);
        break;
      default:
        return; // Escape belongs to the dialog, which reports the cancel.
    }
    event.preventDefault();
  }

  // --- styling --------------------------------------------------------------

  protected readonly className = css({ display: 'inline-flex' });

  protected readonly bodyClassName = computed(() => {
    const options = this.componentOptions();
    const loupe = options.loupeSize ?? 96;
    return css({
      display: 'flex',
      flexDirection: 'column',
      ...this.theme.gap('sm'),
      width: options.width ?? '720px',
      maxWidth: '100%',

      '& > [data-part="hint"], & [data-part="reading"]': {
        ...this.theme.typeface(options.hintTypeface),
        ...this.theme.color(options.hintColor),
      },
      '& > [data-part="error"]': {
        ...this.theme.typeface(options.hintTypeface),
        ...this.theme.color('warn'),
      },
      '& > [data-part="photos"]': { display: 'flex', flexWrap: 'wrap', ...this.theme.gap('xs') },

      '& > [data-part="stage"]': {
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        ...this.theme.backgroundColor(options.stageColor),
        ...this.theme.radius(options.stageBorderRadius),
      },
      // Shrink-wraps the canvas, so the loupe's offsets are the canvas's own.
      '& [data-part="frame"]': { position: 'relative', lineHeight: 0, maxWidth: '100%' },
      '& [data-part="frame"] > canvas': {
        display: 'block',
        maxWidth: '100%',
        maxHeight: '60vh',
        cursor: 'crosshair',
        // A drag over the photo moves the sample point, not the page.
        touchAction: 'none',
        // Inside the canvas: the stage clips at its radius, and a ring drawn
        // outside would lose its top and bottom to it.
        '&:focus-visible': this.theme.focusRingStyle(undefined, -3),
      },
      '& [data-part="loupe"]': {
        position: 'absolute',
        width: loupe,
        height: loupe,
        // Above the point, so a fingertip does not cover what it is reading.
        translate: '-50% calc(-100% - 12px)',
        borderRadius: '50%',
        overflow: 'hidden',
        pointerEvents: 'none',
        ...this.theme.border(options.loupeBorder),
        ...this.theme.boxShadow('menu'),
        display: 'none',
        '&[data-on]': { display: 'block' },
        '& > canvas': { width: '100%', height: '100%', imageRendering: 'pixelated' },
        // The point itself, at the middle of the magnified region.
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          margin: 'auto',
          width: 8,
          height: 8,
          borderRadius: '50%',
          border: '1px solid #fff',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.6)',
        },
      },

      '& > [data-part="foot"]': {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        ...this.theme.gap('sm'),
      },
      '& [data-part="reading"]': { marginRight: 'auto', minWidth: 0 },
    });
  });
}
