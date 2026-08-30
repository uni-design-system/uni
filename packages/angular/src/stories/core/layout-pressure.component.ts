import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { css } from '@emotion/css';

import { UniGridDirective } from '../../lib/components/layout';
import { UniComboboxComponent } from '../../lib/components/combobox/combobox.component';
import { UniDateInputComponent } from '../../lib/components/date-input/date-input.component';
import { UniInputComponent } from '../../lib/components/input/input.component';
import { UniNumberInputComponent } from '../../lib/components/number-input/number-input.component';
import { UniNumberRangeInputComponent } from '../../lib/components/number-range-input/number-range-input.component';
import { UniQuantityStepperComponent } from '../../lib/components/quantity-stepper/quantity-stepper.component';
import { UniSelectComponent } from '../../lib/components/select-input/select-input.component';
import { UniSliderComponent } from '../../lib/components/slider/slider.component';
import { UniTagInputComponent } from '../../lib/components/tag-input/tag-input.component';
import { UniTextareaComponent } from '../../lib/components/textarea/textarea.component';
import { UniTimeInputComponent } from '../../lib/components/time-input/time-input.component';
import { ThemeService } from '../../lib/theming';

/**
 * Every form control in an `auto 1fr` grid, next to a sibling that gets what is
 * left.
 *
 * A control that reports a larger intrinsic width than it needs steals track
 * width from whatever sits beside it, because `1fr` is `minmax(auto, 1fr)` and
 * that `auto` floor is the control's own min-content size. This is invisible to
 * the test suites — they assert computed styles and ARIA, not layout
 * contribution — and it shipped once: `uni-quantity-stepper`'s value cell is a
 * native `<input>`, which defaults to `size="20"`, so `flex-basis: auto`
 * resolved to ~20 characters and the control measured ~230px instead of ~92px.
 *
 * Read the **remaining** column. A control whose number is much smaller than
 * its neighbours' is claiming space it does not use.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-layout-pressure',
  imports: [
    UniGridDirective,
    UniComboboxComponent,
    UniDateInputComponent,
    UniInputComponent,
    UniNumberInputComponent,
    UniNumberRangeInputComponent,
    UniQuantityStepperComponent,
    UniSelectComponent,
    UniSliderComponent,
    UniTagInputComponent,
    UniTextareaComponent,
    UniTimeInputComponent,
  ],
  templateUrl: './layout-pressure.component.html',
})
export class UniLayoutPressureComponent {
  private readonly theme = inject(ThemeService);
  private readonly cells = viewChildren<ElementRef<HTMLElement>>('cell');
  private readonly fillers = viewChildren<ElementRef<HTMLElement>>('filler');

  /** Names in template order; `cells`/`fillers` come back in the same order. */
  protected readonly names = [
    'uni-input',
    'uni-number-input',
    'uni-quantity-stepper',
    'uni-number-range-input',
    'uni-slider',
    'uni-select',
    'uni-combobox',
    'uni-tag-input',
    'uni-date-input',
    'uni-time-input',
    'uni-textarea',
  ];

  protected readonly widths = signal<{ control: number; remaining: number }[]>([]);

  protected readonly options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Cherry', value: 'cherry' },
  ];

  private observer?: ResizeObserver;

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.observer?.disconnect());

    // Layout is only real after a render, and it moves with the viewport.
    afterNextRender(() => {
      this.observer = new ResizeObserver(() => this.measure());
      for (const filler of this.fillers()) this.observer.observe(filler.nativeElement);
      this.measure();
    });
  }

  private measure(): void {
    const cells = this.cells();
    const fillers = this.fillers();
    this.widths.set(
      cells.map((cell, index) => ({
        control: Math.round(cell.nativeElement.getBoundingClientRect().width),
        remaining: Math.round(fillers[index]?.nativeElement.getBoundingClientRect().width ?? 0),
      }))
    );
  }

  protected widthOf(index: number): string {
    const entry = this.widths()[index];
    return entry ? `${entry.control}px` : '—';
  }

  protected remainingOf(index: number): string {
    const entry = this.widths()[index];
    return entry ? `${entry.remaining}px` : '—';
  }

  // --- Styling --------------------------------------------------------------

  /**
   * The width is the whole point: with a wide canvas nothing competes for the
   * track and a control with an inflated floor looks fine.
   */
  protected readonly frameClass = css({ maxWidth: 860 });

  protected readonly rowClass = css({ alignItems: 'center' });

  /**
   * The sibling: whatever the control leaves behind, made visible. Painted in
   * the accent rather than a container token, because this is a measuring
   * stick — it has to contrast in every theme, and `primary-container` is white
   * in some of them.
   */
  protected readonly fillerClass = css({
    ...this.theme.backgroundColor('primary'),
    ...this.theme.radius('xs'),
    minWidth: 0,
    height: 10,
  });

  protected readonly readoutClass = css({
    ...this.theme.typeface('caption'),
    ...this.theme.color('on-surface-variant'),
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    textAlign: 'end',
  });

  protected readonly nameClass = css({
    ...this.theme.typeface('caption'),
    ...this.theme.color('on-surface-variant'),
    whiteSpace: 'nowrap',
  });
}
