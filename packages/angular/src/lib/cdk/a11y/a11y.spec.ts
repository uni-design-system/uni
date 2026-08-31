/**
 * Regression guard for the sr-only overflow escape.
 *
 * `visuallyHidden` used to be `position: absolute`. The controls that emit it
 * are `position: static`, so each span resolved its containing block to
 * whatever positioned box happened to sit above it in the *consumer's* layout,
 * skipped every `overflow: auto` in between, and landed in that distant
 * ancestor's scrollable overflow. A consuming app reported a fixed side panel
 * whose `scrollHeight` was 1891px against a `clientHeight` of 793px — all of it
 * from seven 1x1 invisible spans.
 *
 * The bug is invisible in isolation and only surfaces once a consumer nests
 * these controls inside a scrolling shell, which is exactly why it needs a
 * test that outlives whoever remembers the story.
 */
import type { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { css } from '@emotion/css';
import { visuallyHidden } from './a11y';
import { UniIconButtonComponent } from '../../components/icon-button/icon-button.component';
import { UniNumberInputComponent } from '../../components/number-input/number-input.component';
import { UniQuantityStepperComponent } from '../../components/quantity-stepper/quantity-stepper.component';
import { UniSkeletonComponent } from '../../components/skeleton/skeleton.component';

describe('visuallyHidden', () => {
  it('is fixed, so it never joins an ancestor scroll container', () => {
    // If this fails, read the comment on `visuallyHidden` before "fixing" it:
    // `absolute` re-homes the span into an arbitrary ancestor of the consuming
    // app and inflates that ancestor's scrollHeight.
    expect(visuallyHidden.position).toBe('fixed');
  });

  it('still hides the element from sighted users', () => {
    expect(visuallyHidden.clipPath).toBe('inset(50%)');
    expect(visuallyHidden.width).toBe(1);
    expect(visuallyHidden.height).toBe(1);
  });
});

/**
 * The recipe is only half the contract — what matters is what reaches the DOM.
 * Each of these controls renders at least one sr-only element; none of them
 * establishes a containing block of its own, which is the condition that made
 * the escape possible.
 */
describe('sr-only elements as rendered', () => {
  const className = css(visuallyHidden);

  const mount = async <T,>(
    component: Type<T>,
    inputs: Record<string, unknown>
  ): Promise<ComponentFixture<T>> => {
    await TestBed.configureTestingModule({ imports: [component] }).compileComponents();
    const fixture = TestBed.createComponent(component);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    return fixture;
  };

  const hiddenElements = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(`.${className}`)
    );

  // `inputs` carries only what each control needs to render its sr-only
  // content at all — a required label, or the optional one that turns the
  // skeleton into a live region.
  const cases = [
    ['uni-icon-button', UniIconButtonComponent, {}],
    ['uni-number-input', UniNumberInputComponent, { label: 'Quantity' }],
    ['uni-quantity-stepper', UniQuantityStepperComponent, { label: 'Quantity' }],
    ['uni-skeleton', UniSkeletonComponent, { label: 'Loading' }],
  ] as const;

  for (const [name, component, inputs] of cases) {
    it(`${name} emits sr-only content that stays out of ancestor overflow`, async () => {
      const fixture = await mount(component as never, inputs);
      const hidden = hiddenElements(fixture);

      expect(hidden.length).toBeGreaterThan(0);
      for (const element of hidden) {
        expect(getComputedStyle(element).position).toBe('fixed');
      }
    });
  }
});
