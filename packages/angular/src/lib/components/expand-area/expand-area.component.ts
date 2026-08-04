import { booleanAttribute, ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import type { NullableSize } from '@uni-design-system/uni-core';
import { UniExpandToggleComponent } from '../expand-toggle/expand-toggle.component';
import { UniExpandComponent } from '../expand/expand.component';
import { UniBoxComponent } from '../layout';
import { UniTextComponent } from '../text/text.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-expand-area',
  imports: [UniBoxComponent, UniTextComponent, UniExpandToggleComponent, UniExpandComponent],
  template: `
    <div box-layout color="tertiary-surface" borderRadius="sm" border="quaternary" overflow="hidden">
      <div box-layout
        border="quaternary"
        borderRadius="sm"
        color="primary-surface"
        style="margin-top: -1px; margin-left: -1px; margin-right: -1px"
        [style.margin-bottom]="toggle.collapsed() ? '-1px' : 0"
        justifyContent="space-between"
        display="flex"
        alignItems="center"
      >
        <div box-layout [width]="36"></div>
        <div box-layout paddingHorizontal="md">
          <span uni-text="title-small" display="block">
            {{ title() }}
          </span>
        </div>

        <uni-expand-toggle
          #toggle
          style="display: inline-flex; margin: -2px"
          [collapsed]="initCollapsed()"
          [ariaControls]="expand.regionId"
          [transitionSpeed]="expand.duration()"
        />
      </div>

      <uni-expand #expand [collapsed]="toggle.collapsed()">
        <div box-layout [padding]="padding()">
          <ng-content></ng-content>
        </div>
      </uni-expand>
    </div>
  `,
})
export class UniExpandAreaComponent {
  title = input.required<string>();
  initCollapsed = input(false, { transform: booleanAttribute });
  padding = input<NullableSize>('md');

  collapsed = output<boolean>();

  toggleRef = viewChild.required<UniExpandToggleComponent>('toggle');

  public toggleExpand() {
    this.toggleRef().toggle();
  }
}
