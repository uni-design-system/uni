import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostBinding,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { css } from '@emotion/css';
import type {
  ContainerColorToken,
  OptionalSize,
  Radius,
  Variant,
} from '@uni-design-system/uni-core';
import { ThemeService } from '../../theming';
import type { ScrollbarAppearance } from './scroll-area.types';

type OptionalValue = string | number | undefined;

/**
 * Native scroll area with theme-driven scrollbar styling.
 *
 * Scrollbars are styled entirely through Emotion-generated CSS:
 * `::-webkit-scrollbar` rules cover Chromium/Safari, with a
 * `scrollbar-width`/`scrollbar-color` fallback for Firefox.
 */
@Component({
  selector: 'div[uni-scroll-area], ScrollArea, div[scroll-area]',
  standalone: true,
  imports: [],
  template: `<div #viewport [class]="viewportClassName()">
    <div
      #content
      [class]="contentClassName()"
      [class.isVerticallyScrollable]="isVerticallyScrollable()"
    >
      <ng-content></ng-content>
    </div>
  </div>`,
})
export class UniScrollAreaComponent {
  theme = inject(ThemeService);

  isVerticallyScrollable = signal<boolean>(false);

  viewport = viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  content = viewChild.required<ElementRef<HTMLDivElement>>('content');

  color = input<ContainerColorToken>();
  borderRadius = input<Radius>('sm');
  padding = input<OptionalSize>();
  paddingHorizontal = input<OptionalSize>();
  paddingVertical = input<OptionalSize>();
  paddingLeft = input<OptionalSize>();
  paddingRight = input<OptionalSize>();
  paddingTop = input<OptionalSize>();
  paddingBottom = input<OptionalSize>();
  border = input<Variant>();
  height = input<OptionalValue>();
  width = input<OptionalValue>();
  appearance = input<ScrollbarAppearance>('compact');
  autoHeightDisabled = input<boolean>(false);
  verticalScrollPadding = input<number>(29);

  scrollable = output<boolean>();

  public scrollToBottom() {
    const viewport = this.viewport().nativeElement;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
  }

  public scrollToTop() {
    this.viewport().nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostBinding('class') get className() {
    return css({
      display: 'block',
      overflow: 'hidden',
      height: this.height(),
      width: this.width(),

      ...this.theme.colorPair(this.color()),
      ...this.theme.radius(this.borderRadius()),
      ...this.theme.border(this.border()),
    });
  }

  protected viewportClassName = computed(() => {
    const palette = this.theme.colors();
    const thumbColor = palette['on-primary-surface'];
    const trackColor = palette['primary-surface'];
    const thickness = this.appearance() === 'standard' ? 13 : 8;

    return css([
      {
        height: '100%',
        width: '100%',
        overflow: 'auto',

        '&::-webkit-scrollbar': {
          width: thickness,
          height: thickness,
        },

        '&::-webkit-scrollbar-thumb': {
          backgroundColor: thumbColor,
          borderRadius: 7,
          border: `3px solid ${trackColor}`,
          boxSizing: 'border-box',
        },

        '&::-webkit-scrollbar-track': {
          backgroundColor: trackColor,
          borderRadius: 12,
        },

        // Firefox has no ::-webkit-scrollbar support; fall back to the
        // standard scrollbar properties there.
        '@supports not selector(::-webkit-scrollbar)': {
          scrollbarWidth: this.appearance() === 'standard' ? 'auto' : 'thin',
          scrollbarColor: `${thumbColor} ${trackColor}`,
        },
      },
      this.appearance() === 'standard' && {
        '&::-webkit-scrollbar-track': {
          backgroundColor: trackColor,
          borderRadius: 12,
          ...this.theme.border('quaternary'),
        },
      },
    ]);
  });

  protected contentClassName = computed(() =>
    css({
      ...this.theme.padding(this.padding()),
      ...this.theme.horizontalPadding(this.paddingHorizontal()),
      ...this.theme.verticalPadding(this.paddingVertical()),
      ...this.theme.paddingLeft(this.paddingLeft()),
      ...this.theme.paddingRight(this.paddingRight()),
      ...this.theme.paddingTop(this.paddingTop()),
      ...this.theme.paddingBottom(this.paddingBottom()),

      '&.isVerticallyScrollable': {
        paddingRight: this.verticalScrollPadding(),
      },
    })
  );

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const viewport = this.viewport().nativeElement;
      const content = this.content().nativeElement;

      const updateScrollable = () => {
        const scrollable = viewport.scrollHeight > viewport.clientHeight;
        if (scrollable !== this.isVerticallyScrollable()) {
          this.isVerticallyScrollable.set(scrollable);
          this.scrollable.emit(scrollable);
        }
      };

      const observer = new ResizeObserver(updateScrollable);
      observer.observe(viewport);
      observer.observe(content);
      destroyRef.onDestroy(() => observer.disconnect());

      updateScrollable();
    });
  }
}
