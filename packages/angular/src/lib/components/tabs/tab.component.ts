import { ChangeDetectionStrategy, Component, input, viewChild, TemplateRef } from '@angular/core';
import { uniqueId } from '../../cdk';

/**
 * One tab inside `uni-tabs`: a label for the tablist plus projected panel
 * content. Content is captured in a template and only instantiated while the
 * tab is selected, so inactive panels cost nothing.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-tab, Tab',
  template: `<ng-template #content><ng-content /></ng-template>`,
})
export class UniTabComponent {
  label = input.required<string>();
  disabled = input(false);

  /** Stable ids wiring tab ↔ panel ARIA relationships. */
  readonly id = uniqueId('uni-tab');
  readonly panelId = `${this.id}-panel`;

  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}
