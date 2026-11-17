/**
 * jsdom has no canvas and loads no images, so both are stood in for: an
 * `Image` that "loads" on the next microtask, and a 2D context whose pixels
 * come from a function of (x, y). What is asserted is the component's policy —
 * which path opens, what a sample is, what the keys do, what is announced.
 * The loupe's geometry and the real decode are the Storybook story's.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniEyedropperComponent } from './eyedropper.component';
import type { UniSampledColor } from './eyedropper.model';

const NAVY = [0x43, 0x4c, 0x5a, 255];
const WHITE = [255, 255, 255, 255];

/** A 200 × 100 flat navy photograph with one white pixel dead center. */
const pixelAt = (x: number, y: number) => (x === 100 && y === 50 ? WHITE : NAVY);

class FakeImage {
  naturalWidth = 200;
  naturalHeight = 100;
  crossOrigin = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(value: string) {
    queueMicrotask(() => (value.includes('broken') ? this.onerror?.() : this.onload?.()));
  }
}

describe('UniEyedropperComponent', () => {
  let fixture: ComponentFixture<UniEyedropperComponent>;
  let host: HTMLElement;
  let samples: UniSampledColor[];
  let cancels: number;

  const create = async (inputs: Record<string, unknown> = {}) => {
    await TestBed.configureTestingModule({ imports: [UniEyedropperComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniEyedropperComponent);
    host = fixture.nativeElement;
    document.body.appendChild(host);
    samples = [];
    cancels = 0;
    fixture.componentInstance.sampled.subscribe((sample) => samples.push(sample));
    fixture.componentInstance.canceled.subscribe(() => cancels++);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  };

  const settle = async () => {
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  };

  const trigger = () => host.querySelector<HTMLButtonElement>('button')!;
  const dialog = () => host.querySelector<HTMLDialogElement>('dialog')!;
  const canvas = () => host.querySelector<HTMLCanvasElement>('canvas[tabindex]')!;
  const status = () => host.querySelector('[role="status"]')!.textContent!.trim();
  const key = (name: string, shiftKey = false) =>
    canvas().dispatchEvent(new KeyboardEvent('keydown', { key: name, shiftKey, cancelable: true }));

  const openSampler = async () => {
    trigger().click();
    await settle();
    canvas().focus();
    await settle();
  };

  beforeEach(() => {
    vi.stubGlobal('Image', FakeImage);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => ({
      drawImage: () => undefined,
      putImageData: () => undefined,
      getImageData: (left: number, top: number, width: number, height: number) => {
        const data: number[] = [];
        for (let y = top; y < top + height; y++) {
          for (let x = left; x < left + width; x++) data.push(...pixelAt(x, y));
        }
        return { data: new Uint8ClampedArray(data), width, height };
      },
    })) as never);
  });

  afterEach(() => {
    host?.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete (window as { EyeDropper?: unknown }).EyeDropper;
  });

  it('has nothing to sample without images or a native eyedropper', async () => {
    await create();
    expect(trigger().disabled).toBe(true);
  });

  it('keeps one label on the trigger whichever path it takes', async () => {
    await create({ images: ['a.jpg'], label: 'Pick from a photo' });
    expect(trigger().textContent?.trim()).toBe('Pick from a photo');
  });

  describe('over an image', () => {
    beforeEach(() => create({ images: ['a.jpg', 'b.jpg'] }));

    it('opens the sampler with a tab per photo', async () => {
      await openSampler();

      expect(dialog().open).toBe(true);
      const tabs = host.querySelectorAll('[aria-pressed]');
      expect(Array.from(tabs).map((tab) => tab.getAttribute('aria-pressed'))).toEqual(['true', 'false']);
    });

    /**
     * The pointer starts on the one white pixel. One pixel of a photographed
     * chip is noise: the sample is the mean of the 9 × 9 region around it.
     */
    it('takes the mean of the region, not the pixel under the point', async () => {
      await openSampler();
      key('Enter');
      await settle();

      expect(samples).toHaveLength(1);
      expect(samples[0].hex).not.toBe('#FFFFFF');
      expect(samples[0].hex).toBe('#454E5C');
      expect(samples[0]).toMatchObject({ source: 'image', imageIndex: 0, point: { x: 0.5, y: 0.5 } });
      expect(cancels).toBe(0);
    });

    it('sizes the region from sampleRadius', async () => {
      fixture.componentRef.setInput('sampleRadius', 0);
      await openSampler();
      key('Enter');

      expect(samples[0].hex).toBe('#FFFFFF');
    });

    it('nudges the point with the arrows, ten at a time with Shift', async () => {
      await openSampler();
      const right = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
      canvas().dispatchEvent(right);
      key('ArrowRight', true);
      key('ArrowDown');
      key('ArrowUp', true);
      key('Enter');

      expect(right.defaultPrevented).toBe(true);
      expect(samples[0].point).toEqual({ x: 111 / 200, y: 41 / 100 });
      // Clear of the white dot now: the flat color, exactly.
      expect(samples[0].hex).toBe('#434C5A');
    });

    it('announces the sample by hue, not only by its characters', async () => {
      await openSampler();
      key('ArrowRight', true);
      key('Enter');
      await settle();

      expect(status()).toBe('Sampled #434C5A, a dark slate blue.');
    });

    it('reports a cancel when the dialog is left without a sample', async () => {
      await openSampler();
      dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
      await settle();

      expect(samples).toEqual([]);
      expect(cancels).toBe(1);
    });

    it('reports one cancel from its Cancel button', async () => {
      await openSampler();
      const button = Array.from(dialog().querySelectorAll('button')).find(
        (candidate) => candidate.textContent?.trim() === 'Cancel'
      )!;
      button.click();
      await settle();

      expect(dialog().hasAttribute('closing')).toBe(true);
      expect(cancels).toBe(1);
    });

    it('samples from the photo whose tab is chosen', async () => {
      await openSampler();
      (host.querySelectorAll('[aria-pressed]')[1] as HTMLElement).click();
      await settle();
      key('Enter');

      expect(samples[0].imageIndex).toBe(1);
    });
  });

  it('reads nothing from a photo that could not be loaded, and says so', async () => {
    await create({ images: ['broken.jpg'] });
    await openSampler();
    key('Enter');
    await settle();

    expect(samples).toEqual([]);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("couldn't be loaded");
  });

  describe('with a native eyedropper', () => {
    let open: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      open = vi.fn().mockResolvedValue({ sRGBHex: '#434c5a' });
      (window as { EyeDropper?: unknown }).EyeDropper = class {
        open = open;
      };
    });

    it('samples the screen when there are no images', async () => {
      await create();
      expect(trigger().disabled).toBe(false);
      trigger().click();
      await settle();

      expect(dialog().open).toBe(false);
      expect(samples).toEqual([{ hex: '#434C5A', source: 'screen' }]);
      expect(status()).toBe('Sampled #434C5A, a dark slate blue.');
    });

    it('reports a cancel when the user backs out of it', async () => {
      open.mockRejectedValue(new DOMException('canceled', 'AbortError'));
      await create();
      trigger().click();
      await settle();

      expect(samples).toEqual([]);
      expect(cancels).toBe(1);
    });

    it('stays out of it when preferNative is off', async () => {
      await create({ preferNative: false });
      expect(trigger().disabled).toBe(true);
    });

    it('opens the photo sampler when there are images, and offers the screen inside it', async () => {
      await create({ images: ['a.jpg'] });
      await openSampler();

      expect(dialog().open).toBe(true);
      expect(open).not.toHaveBeenCalled();
      const fromScreen = Array.from(dialog().querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === 'From the screen'
      )!;
      fromScreen.click();
      await settle();

      expect(samples).toEqual([{ hex: '#434C5A', source: 'screen' }]);
      expect(cancels).toBe(0);
    });
  });

  it('offers no screen button where the browser has no eyedropper', async () => {
    await create({ images: ['a.jpg'] });
    await openSampler();
    expect(dialog().textContent).not.toContain('From the screen');
  });
});
