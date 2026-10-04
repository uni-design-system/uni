import { Directive, inject, TemplateRef } from '@angular/core';

import type { UniTagSuggestionContext } from './tag-input.model';

/**
 * Row template for `uni-tag-input` suggestions:
 *
 * ```html
 * <uni-tag-input label="To" [suggestions]="people">
 *   <ng-template uniTagSuggestion let-person let-active="active">…</ng-template>
 * </uni-tag-input>
 * ```
 *
 * Only the row's content is replaced — the field keeps owning the
 * `role="option"` element, its id and its active state.
 */
@Directive({ selector: 'ng-template[uniTagSuggestion]' })
export class UniTagSuggestionDirective {
  readonly template = inject<TemplateRef<UniTagSuggestionContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: UniTagSuggestionDirective,
    _context: unknown
  ): _context is UniTagSuggestionContext {
    return true;
  }
}
