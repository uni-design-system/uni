import { Component, HostBinding, inject, input } from '@angular/core';
import { css } from '@emotion/css';

import type {
  ContainerColorToken,
  OptionalAlignContent,
  OptionalAlignItems,
  OptionalAlignSelf,
  OptionalBorder,
  OptionalColor,
  OptionalDisplay,
  OptionalFlexDirection,
  OptionalJustifyContent,
  OptionalOverflow,
  OptionalPosition,
  OptionalRadius,
  OptionalSize,
  OptionalTextAlign,
  OptionalWrap,
  Shadow,
  Variant,
  ZIndexableElements,
} from '@uni-design-system/uni-core';

import { ThemeService } from '../../../theming/theme.service';

@Component({
  selector: 'div[uni-box-layout], Box, div[box-layout]',
  standalone: true,
  imports: [],
  template: `<ng-content></ng-content>`,
})
export class UniBoxComponent {
  theme = inject(ThemeService);

  color = input<ContainerColorToken>();
  backgroundColor = input<OptionalColor>();
  borderRadius = input<OptionalRadius>();
  borderRadiusLeft = input<OptionalRadius>();
  borderRadiusRight = input<OptionalRadius>();
  borderRadiusTop = input<OptionalRadius>();
  borderRadiusBottom = input<OptionalRadius>();
  padding = input<OptionalSize>();
  paddingHorizontal = input<OptionalSize>();
  paddingVertical = input<OptionalSize>();
  paddingLeft = input<OptionalSize>();
  paddingRight = input<OptionalSize>();
  paddingTop = input<OptionalSize>();
  paddingBottom = input<OptionalSize>();
  border = input<OptionalBorder>();
  borderTop = input<OptionalBorder>();
  borderBottom = input<OptionalBorder>();
  borderLeft = input<OptionalBorder>();
  borderRight = input<OptionalBorder>();
  dashBorder = input<boolean>(false);
  alignSelf = input<OptionalAlignSelf>();
  alignItems = input<OptionalAlignItems>();
  alignContent = input<OptionalAlignContent>();
  justifyContent = input<OptionalJustifyContent>();
  grow = input<number>();
  display = input<OptionalDisplay>();
  position = input<OptionalPosition>();
  inset = input<number | string>();
  height = input<number | string>();
  minHeight = input<number | string>();
  maxHeight = input<number | string>();
  width = input<number | string>();
  minWidth = input<number | string>();
  maxWidth = input<number | string>();
  ignoreDir = input(true);
  gridArea = input<string>();
  gridColumn = input<string>();
  gridRow = input<string>();
  overflow = input<OptionalOverflow>();
  elevation = input<Shadow>(); // Deprecated, use shadow instead
  shadow = input<Shadow>();
  gap = input<OptionalSize>();
  fullWidth = input<boolean>();
  fullHeight = input<boolean>();
  flexDirection = input<OptionalFlexDirection>();
  textAlign = input<OptionalTextAlign>();
  wrapItems = input<OptionalWrap>(undefined);
  zIndex = input<ZIndexableElements>();

  @HostBinding('class') get boxClassName() {
    return css([
      {
        ...this.theme.colorPair(this.color()),
        ...this.theme.backgroundColor(this.backgroundColor()),
        display: this.alignSelf() ? 'flex' : 'block',
        position: this.position(),
        inset: this.inset(),
        boxSizing: 'border-box',
        height: this.height(),
        minHeight: this.minHeight(),
        maxHeight: this.maxHeight(),
        width: this.width(),
        minWidth: this.minWidth(),
        maxWidth: this.maxWidth(),
        flexWrap: this.wrapItems(),
        overflow: this.overflow(),
        ...this.theme.padding(this.padding()),
        ...this.theme.horizontalPadding(this.paddingHorizontal()),
        ...this.theme.verticalPadding(this.paddingVertical()),
        ...this.theme.paddingLeft(this.paddingLeft()),
        ...this.theme.paddingRight(this.paddingRight()),
        ...this.theme.paddingTop(this.paddingTop()),
        ...this.theme.paddingBottom(this.paddingBottom()),
        ...this.theme.boxShadow(this.elevation()),
        ...this.theme.boxShadow(this.shadow()),
        ...this.theme.radius(this.borderRadius()),
        ...this.theme.getRadiusLeft(this.borderRadiusLeft()),
        ...this.theme.getRadiusRight(this.borderRadiusRight()),
        ...this.theme.getRadiusTop(this.borderRadiusTop()),
        ...this.theme.getRadiusBottom(this.borderRadiusBottom()),
        ...this.theme.borderTop(this.borderTop()),
        ...this.theme.borderBottom(this.borderBottom()),
        ...this.theme.borderLeft(this.borderLeft()),
        ...this.theme.borderRight(this.borderRight()),
        ...this.theme.gap(this.gap()),
        ...this.theme.style('display', this.display()),
        ...this.theme.style('alignSelf', this.alignSelf()),
        ...this.theme.style('alignItems', this.alignItems()),
        ...this.theme.style('justifyContent', this.justifyContent()),
        ...this.theme.style('alignContent', this.alignContent()),
        ...this.theme.style('flexGrow', this.grow()),
        ...this.theme.style('flexDirection', this.flexDirection()),
        ...this.theme.style('gridArea', this.gridArea()),
        ...this.theme.style('gridColumn', this.gridColumn()),
        ...this.theme.style('gridRow', this.gridRow()),
        ...this.theme.style('textAlign', this.textAlign()),
        ...this.theme.zIndex(this.zIndex()),
      },
      this.border() &&
        !this.dashBorder() && {
          ...this.theme.border(this.border()),
        },
      this.border() &&
        this.dashBorder() && {
          ...this.theme.getDashedBorder(this.border() as Variant, this.borderRadius()),
        },

      this.fullWidth() && {
        width: '100%',
      },
      this.fullHeight() && {
        height: '100%',
      },

      this.ignoreDir() &&
        (this.flexDirection() ?? 'row') === 'row' && {
          '&:dir(rtl)': {
            flexDirection: 'row-reverse',
          },
        },
      this.ignoreDir() &&
        (this.flexDirection() ?? 'row') === 'row-reverse' && {
          '&:dir(rtl)': {
            flexDirection: 'row',
          },
        },
    ]);
  }
}
