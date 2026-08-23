import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniCardComponent } from '../card/card.component';
import { UniScrollAreaComponent } from '../scroll-area/scroll-area.component';
import { UniSkeletonComponent } from '../skeleton/skeleton.component';
import { UniTextDirective } from '../text/text.directive';
import { ThemeService } from '../../theming';
import { UniBoxDirective } from './box/box.directive';
import { UniRowDirective } from './row/row.directive';

/** jsdom reports computed colors as rgb(); hex tokens need normalizing. */
const toRgb = (hex: string): string => {
  const probe = document.createElement('div');
  probe.style.color = hex;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  return rgb;
};

/**
 * The layout primitives and `uni-text` were components until 8.5.0, so any two
 * of them on one element threw NG0300 ("multiple components match") — in dev
 * only, which is how `<div row-layout uni-text="…">` reached production as a
 * silent mismatch. As directives they compose, and Angular merges their host
 * `class` bindings additively instead of letting one win.
 */
@Component({
  imports: [
    UniBoxDirective,
    UniRowDirective,
    UniTextDirective,
    UniCardComponent,
    UniSkeletonComponent,
    UniScrollAreaComponent,
  ],
  template: `
    <div row-layout uni-text="title-small" padding="md" gap="sm" id="two-attributes">Heading</div>
    <div
      row-layout
      uni-text="title-small"
      containerColor="primary-container"
      color="on-surface-variant"
      id="shared-color"
    >
      Heading
    </div>
    <uni-card box-layout padding="lg" id="on-a-component">Card body</uni-card>
    <uni-skeleton box-layout padding="md" id="class-binding-component" />
    <div
      scroll-area
      uni-text="title-small"
      containerColor="primary-container"
      color="on-surface-variant"
      id="scroll-area-color"
    >
      Scrollable
    </div>
    <div row-layout uni-text="title-small" containerColor="primary-container" id="inherit-on-color">
      Heading
    </div>
  `,
})
class Host {}

describe('layout composition', () => {
  let fixture: ComponentFixture<Host>;

  const el = (id: string): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector(`#${id}`)!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('stacks a layout attribute and uni-text on one element', () => {
    const style = getComputedStyle(el('two-attributes'));
    expect(style.display).toBe('flex'); // from row-layout
    expect(style.padding).toBe('16px'); // from row-layout
    expect(style.fontSize).toBe('14px'); // title-small, from uni-text
  });

  // The two directives own different names — `color` is the CSS property and
  // belongs to uni-text; the box's container pair is `containerColor` — so
  // neither can claim the other's binding and render ink on identical ink.
  it('keeps ink and container independent on a shared element', () => {
    const colors = TestBed.inject(ThemeService).colors();
    const style = getComputedStyle(el('shared-color'));

    // Each binding reached its own directive: the box painted the container,
    // uni-text set the ink — and the ink is NOT the container's paired
    // on-color, which is what a claimed binding would have produced.
    expect(style.backgroundColor).toBe(toRgb(colors['primary-container']!));
    expect(style.color).toBe(toRgb(colors['on-surface-variant']!));
    expect(style.color).not.toBe(style.backgroundColor);
  });

  // uni-scroll-area is attribute-selected too, so it composes with uni-text the
  // same way and needed the same rename.
  it('keeps ink and container independent on a scroll area', () => {
    const colors = TestBed.inject(ThemeService).colors();
    const style = getComputedStyle(el('scroll-area-color'));
    expect(style.backgroundColor).toBe(toRgb(colors['primary-container']!));
    expect(style.color).toBe(toRgb(colors['on-surface-variant']!));
    // Specifically NOT the container's paired on-color.
    expect(style.color).not.toBe(toRgb(colors['on-primary-container']!));
  });

  // No explicit color: the container's paired on-color must still show through.
  it('lets the container on-color through when text sets no color', () => {
    const colors = TestBed.inject(ThemeService).colors();
    const style = getComputedStyle(el('inherit-on-color'));
    expect(style.color).toBe(toRgb(colors['on-primary-container']!));
  });

  it('applies a layout attribute to a component host element', () => {
    expect(getComputedStyle(el('on-a-component')).padding).toBe('32px');
  });

  it('merges host class bindings when the component binds [class] too', () => {
    // Angular reconciles the two class maps additively, so the component's own
    // class survives alongside the box's rather than one silently winning.
    expect(el('class-binding-component').className.match(/css-/g)!.length).toBeGreaterThan(1);
    expect(getComputedStyle(el('class-binding-component')).padding).toBe('16px');
  });
});
