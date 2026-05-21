import { Component, computed, HostBinding, input, Input } from '@angular/core';
import { css } from '@emotion/css';

import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniIconComponent } from '../icon';
import { UniBoxComponent } from '../layout';
import { UniSymbolComponent } from '../symbol';
import { RippleDirective } from '../../directives/ripple';

@Component({
  selector: 'button[uni-text-button], Button, button[text-button]',
  template: `@if (loading()) {
      <Box [class]="spinnerBox"><uni-icon name="spinner" /></Box>
    }
    @if (symbolLeft) {
      <Symbol [name]="symbolLeft" class="symbolLeft" />
    }
    <span><ng-content></ng-content></span>
    @if (symbolRight) {
      <Symbol [name]="symbolRight" class="symbolRight" />
    } `,
  providers: [{ provide: COMPONENT_NAME, useValue: 'button' }],
  imports: [
    RippleDirective, // Keep this import
    UniIconComponent,
    UniBoxComponent,
    UniSymbolComponent,
  ],
  host: {
    '[attr.disabled]': 'disable() || loading() || null',
  },
  hostDirectives: [{ directive: RippleDirective }],
})
export class UniButtonComponent extends BaseComponent {
  readonly disable = input<boolean | undefined>(false);
  readonly loading = input<boolean | undefined>(false);
  readonly fullWidth = input<boolean>(false);

  @Input() symbolLeft?: string;
  @Input() symbolRight?: string;

  spinnerBox = css({
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '100%',
    paddingTop: '6%',
    paddingBottom: '6%',
  });

  @HostBinding('class') get className() {
    return css([
      this.style() && {
        ...this.style(),
      },
      {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        outline: 0,
        border: 0,
        cursor: 'pointer',
        fontFamily: 'Euphemia, sans-serif',
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
      this.variant() !== 'ghost' && {
        '&:hover, &:focus': {
          ...this.theme.boxShadow('raised'),
        },
        '&:focus-visible': {
          outline: `2px solid ${this.theme.colors()[this.variant()]}`,
          outlineOffset: '2px',
        },
      },
      this.variant() === 'ghost' && {
        '&:hover, &:focus': {
          backgroundColor: 'rgba(0,0,0,0.1) !important',
        },
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
          ...this.componentTheme().colors?.disabled,
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
    ]);
  }

  symbolSize = computed(() => {
    const style = this.style();
    const fontString = style['fontSize'] as string;
    const fontSize = parseFloat(fontString);
    return fontSize + 4;
  });
}
