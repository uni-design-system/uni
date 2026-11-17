import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniColorSwatchComponent } from './color-swatch.component';

const HALE_NAVY = { name: 'Hale Navy', detail: 'HC-154 · Benjamin Moore', hex: '#434C5A' };

describe('UniColorSwatchComponent', () => {
  let fixture: ComponentFixture<UniColorSwatchComponent>;
  let host: HTMLElement;

  const set = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  };
  const block = () => host.firstElementChild as HTMLElement;
  const part = (name: string) => host.querySelector(`[data-part="${name}"]`)?.textContent?.trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniColorSwatchComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniColorSwatchComponent);
    host = fixture.nativeElement;
  });

  afterEach(() => vi.restoreAllMocks());

  it('puts the name and detail in the DOM beside a decorative block', () => {
    set(HALE_NAVY);

    expect(part('name')).toBe('Hale Navy');
    expect(part('detail')).toBe('HC-154 · Benjamin Moore');
    expect(block().getAttribute('aria-hidden')).toBe('true');
    expect(block().style.backgroundColor).toBe('rgb(67, 76, 90)');
  });

  it('reads the spellings normalizeHex does', () => {
    set({ name: 'Hale Navy', hex: 'rgb(67, 76, 90)' });
    expect(block().style.backgroundColor).toBe('rgb(67, 76, 90)');

    set({ hex: '434c5a' });
    expect(block().style.backgroundColor).toBe('rgb(67, 76, 90)');
  });

  it('renders the text and an unfilled block without a hex', () => {
    set({ name: 'Hague Blue', detail: 'No. 30' });

    expect(part('name')).toBe('Hague Blue');
    expect(block().style.backgroundColor).toBe('');
  });

  it('refuses a hex that is not one rather than painting it', () => {
    set({ ...HALE_NAVY, hex: 'url(javascript:alert(1))' });
    expect(block().style.backgroundColor).toBe('');
  });

  it('renders only the parts it is given', () => {
    set({ hex: '#434C5A', detail: '#434C5A' });
    expect(part('name')).toBeUndefined();
    expect(part('detail')).toBe('#434C5A');

    set({ caption: 'Sampled' });
    expect(part('caption')).toBe('Sampled');
  });

  it('says so when it is given nothing', () => {
    fixture.detectChanges();
    expect(host.textContent?.trim()).toBe('No color yet');

    set({ emptyLabel: 'Not specified' });
    expect(host.textContent?.trim()).toBe('Not specified');
  });

  describe('card', () => {
    it('is the block alone, named by the color and its hue', () => {
      set({ ...HALE_NAVY, face: 'card' });

      expect(host.children.length).toBe(1);
      expect(host.textContent?.trim()).toBe('');
      expect(block().getAttribute('role')).toBe('img');
      expect(block().getAttribute('aria-label')).toBe(
        'Hale Navy, HC-154 · Benjamin Moore, a dark slate blue'
      );
    });

    it('takes an explicit ariaLabel over the derived one', () => {
      set({ ...HALE_NAVY, face: 'card', ariaLabel: 'Wall color' });
      expect(block().getAttribute('aria-label')).toBe('Wall color');
    });
  });

  describe('dot', () => {
    it('is an image with the given label', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      set({ ...HALE_NAVY, face: 'dot', ariaLabel: 'Hale Navy' });
      TestBed.tick();

      expect(block().getAttribute('role')).toBe('img');
      expect(block().getAttribute('aria-label')).toBe('Hale Navy');
      expect(error).not.toHaveBeenCalled();
    });

    it('raises a dev error without a label, and still names itself', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      set({ ...HALE_NAVY, face: 'dot' });
      TestBed.tick();

      expect(error).toHaveBeenCalledWith(expect.stringContaining('needs an `ariaLabel`'));
      expect(block().getAttribute('aria-label')).toContain('Hale Navy');
    });
  });
});
