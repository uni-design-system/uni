import { Directive, computed, inject, input } from '@angular/core';
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
  NullableSize,
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

import { ThemeService } from '../../../theming';

/**
 * The base layout primitive, applied as an attribute to any element so
 * semantics stay yours: `<main box-layout [grow]="1" padding="md">`. It is a
 * directive, so it composes freely — with another layout attribute
 * (`<div stack-layout uni-text="body-1-long">`) and with a component's own host
 * element (`<uni-card box-layout padding="lg">`); Angular merges the host
 * `class` bindings rather than letting one win.
 *
 * Sizing convention (height/width/min/max/inset): a **number is px and needs
 * a binding** — `[height]="420"`; a **plain attribute is a CSS length
 * string** — `height="420px"`. Spacing/radius/color inputs take theme tokens.
 */
@Directive({
  selector: '[uni-box-layout], [box-layout]',
  host: { '[class]': 'boxClassName()' },
})
export class UniBoxDirective {
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
  /**
   * The `flex` shorthand. `[flex]="1"` is `flex: 1` — grow, shrink and a zero
   * basis — which `grow` alone cannot express, since it leaves
   * `flex-basis: auto`. Wins over `grow` when both are set.
   */
  flex = input<number | string>();
  shrink = input<number>();
  basis = input<number | string>();
  /**
   * Inline-axis margin. `marginInline="auto"` centers a `maxWidth` container —
   * the one thing flex centering cannot do without an extra wrapper. Only the
   * inline axis is exposed: block margins collapse and fight `gap`, which is
   * why the primitives carry no margin otherwise.
   */
  marginInline = input<'auto' | NullableSize>();
  display = input<OptionalDisplay>();
  position = input<OptionalPosition>();
  inset = input<number | string>();
  /** Number = px via binding (`[height]="420"`); string = CSS length (`height="420px"`). */
  height = input<number | string>();
  minHeight = input<number | string>();
  maxHeight = input<number | string>();
  /** Number = px via binding (`[width]="420"`); string = CSS length (`width="50%"`). */
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

  protected readonly boxClassName = computed(() => {
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
        // styleIfSet, not style: `[shrink]="0"` and `[basis]="0"` are
        // meaningful values that a truthiness check would drop.
        ...this.theme.styleIfSet('flex', this.flex()),
        ...this.theme.styleIfSet('flexShrink', this.shrink()),
        ...this.theme.styleIfSet('flexBasis', this.basis()),
        ...this.theme.marginInline(this.marginInline()),
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
  });
}
