import { Directive, TemplateRef, inject } from '@angular/core';
import type { UniRadioOption } from './radio.model';

/** What a projected option template is handed for each option. */
export interface UniRadioOptionContext {
  $implicit: UniRadioOption;
}

/**
 * Content for each of a radio group's options, in place of the plain label
 * string.
 *
 * A group renders N labels from an `options` array, so it cannot take
 * `<ng-content />` the way `uni-checkbox` and `uni-toggle` do — there is no
 * single slot to project into. A template is the shape that survives the
 * repetition: it is instantiated once per option and handed that option, so a
 * row can carry a description, a price or a badge and still be part of the
 * `<label>` that drives the input.
 *
 * ```html
 * <uni-radio [options]="plans">
 *   <ng-template uniRadioOption let-option>
 *     <span uni-text="body-2-long">{{ option.label }}</span>
 *   </ng-template>
 * </uni-radio>
 * ```
 */
@Directive({
  selector: 'ng-template[uniRadioOption]',
})
export class UniRadioOptionDirective {
  readonly template = inject<TemplateRef<UniRadioOptionContext>>(TemplateRef);

  /** Types `let-option` as the option itself rather than as `any`. */
  static ngTemplateContextGuard(
    _directive: UniRadioOptionDirective,
    _context: unknown
  ): _context is UniRadioOptionContext {
    return true;
  }
}
