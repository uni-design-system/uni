import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniCardComponent } from '../card/card.component';
import { UniSkeletonComponent } from '../skeleton/skeleton.component';
import { UniTextDirective } from '../text/text.directive';
import { UniBoxDirective } from './box/box.directive';
import { UniRowDirective } from './row/row.directive';

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
  ],
  template: `
    <div row-layout uni-text="title-small" padding="md" gap="sm" id="two-attributes">Heading</div>
    <div
      row-layout
      uni-text="title-small"
      color="primary-container"
      textColor="on-surface-variant"
      id="shared-color"
    >
      Heading
    </div>
    <uni-card box-layout padding="lg" id="on-a-component">Card body</uni-card>
    <uni-skeleton box-layout padding="md" id="class-binding-component" />
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

  // `color` is an input on both directives, so one binding feeds both: the box
  // paints the container pair and the text takes the same token, rendering ink
  // on ink. `textColor` is the way out.
  it('separates ink from the container when both directives share the element', () => {
    const style = getComputedStyle(el('shared-color'));
    expect(style.color).not.toBe(style.backgroundColor);
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
