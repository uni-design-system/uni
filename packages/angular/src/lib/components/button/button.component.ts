import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css } from '@emotion/css';

import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { UniButtonOptions } from './button.model';
import { UniIconComponent } from '../icon';
import { UniBoxComponent } from '../layout';
import { UniSymbolComponent } from '../symbol';
import { RippleDirective } from '../../directives/ripple';

@Component({
  selector: 'button[uni-text-button], Button, button[text-button]',
  template: `@if (loading()) {
      <Box [class]="spinnerBox"><uni-icon name="spinner" /></Box>
    }
    @if (symbolLeft()) {
      <Symbol [name]="symbolLeft()!" class="symbolLeft" />
    }
    <span><ng-content></ng-content></span>
    @if (symbolRight()) {
      <Symbol [name]="symbolRight()!" class="symbolRight" />
    } `,
  providers: [{ provide: COMPONENT_NAME, useValue: 'button' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RippleDirective, // Keep this import
    UniIconComponent,
    UniBoxComponent,
    UniSymbolComponent,
  ],
  host: {
    '[attr.disabled]': 'disable() || loading() || null',
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[class]': 'className()',
  },
  hostDirectives: [{ directive: RippleDirective }],
})
export class UniButtonComponent extends BaseComponent<UniButtonOptions> {
  readonly disable = input<boolean | undefined>(false);
  readonly loading = input<boolean | undefined>(false);
  readonly fullWidth = input<boolean>(false);

  readonly symbolLeft = input<string>();
  readonly symbolRight = input<string>();

  spinnerBox = css({
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '100%',
    paddingTop: '6%',
    paddingBottom: '6%',
  });

  protected readonly className = computed(() =>
    css([
      // Token-driven radius + typeface from component options. Applied before
      // `style()` so theme `sizes`/`fixed` (per-size fontSize, or hand-set
      // radii/families in older themes) keep winning.
      this.theme.radius(this.componentOptions().borderRadius),
      { ...this.theme.typeface(this.componentOptions().typeface) },
      this.style() && {
        ...this.style(), // TODO: Set priority on theme-defined styles
      },
      {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        outline: 0,
        border: 0,
        cursor: 'pointer',
        transition: 'all 0.28s ease',

        '&:disabled': {
          cursor: 'not-allowed !important',
        },
        '& .symbolLeft': {
          marginLeft: -6,
          marginRight: 4,
          fontSize: this.symbolSize(),
        },
        '& span': {
          alignContent: 'center',
          flexGrow: 1,
          whiteSpace: 'nowrap',
        },
        '& .symbolRight': {
          marginRight: -6,
          marginLeft: 4,
          fontSize: this.symbolSize(),
        },
      },
      // Hover/pressed styling now lives in the theme's button variants
      // (solid vs. hollow, per-variant states). Only the keyboard-focus
      // indicator (WCAG 2.4.7) stays component-owned.
      {
        '&:focus-visible': {
          outline: `2px solid ${this.theme.colors()[this.variant()]}`,
          outlineOffset: '2px',
        },
      },
      this.fullWidth() && {
        width: '100%',
      },
      !this.loading() && {
        '&:disabled': {
          ...this.componentTheme().variants?.disabled,
        },
      },
      this.loading() && {
        '&:disabled symbol': {
          opacity: 0,
        },
        '&:disabled span': {
          opacity: 0,
        },
      },
    ])
  );

  symbolSize = computed(() => {
    const fontSize = parseFloat(String(this.style()['fontSize'] ?? ''));
    // Fall back to the default icon size when the theme defines no fontSize
    return (Number.isNaN(fontSize) ? 16 : fontSize) + 4;
  });
}
