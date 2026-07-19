import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import type { NullableSize } from '@uni-design-system/uni-core';
import { UniExpandToggleComponent } from '../expand-toggle/expand-toggle.component';
import { UniExpandComponent } from '../expand/expand.component';
import { UniBoxComponent } from '../layout';
import { UniTextComponent } from '../text/text.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-expand-area, ExpandArea',
  imports: [UniBoxComponent, UniTextComponent, UniExpandToggleComponent, UniExpandComponent],
  template: `
    <Box color="tertiary-surface" borderRadius="sm" border="quaternary" overflow="hidden">
      <Box
        border="quaternary"
        borderRadius="sm"
        color="primary-surface"
        style="margin-top: -1px; margin-left: -1px; margin-right: -1px"
        [style.margin-bottom]="toggle.collapsed() ? '-1px' : 0"
        justifyContent="space-between"
        display="flex"
        alignItems="center"
      >
        <Box [width]="36"></Box>
        <Box paddingHorizontal="md">
          <Text typeface="title-small" display="block">
            {{ title() }}
          </Text>
        </Box>

        <ExpandToggle
          #toggle
          style="display: inline-flex; margin: -2px"
          [collapsed]="initCollapsed()"
          [ariaControls]="expand.regionId"
        />
      </Box>

      <Expand #expand [collapsed]="toggle.collapsed()">
        <Box [padding]="padding()">
          <ng-content></ng-content>
        </Box>
      </Expand>
    </Box>
  `,
})
export class UniExpandAreaComponent {
  title = input.required<string>();
  initCollapsed = input(false);
  padding = input<NullableSize>('md');

  collapsed = output<boolean>();

  toggleRef = viewChild.required<UniExpandToggleComponent>('toggle');

  public toggleExpand() {
    this.toggleRef().toggle();
  }
}
