import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
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
  selector: '[uni-scroll-area], [scroll-area]',
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
  host: { '[class]': 'className()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniScrollAreaComponent {
  theme = inject(ThemeService);

  isVerticallyScrollable = signal<boolean>(false);

  viewport = viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  content = viewChild.required<ElementRef<HTMLDivElement>>('content');

  /**
   * A container color *pair*: the named surface plus its paired on-color.
   *
   * Named `containerColor`, not `color`, for the same reason as the layout
   * primitives: this is an attribute directive-style selector that shares
   * elements with `uni-text`, which owns `color` and maps it to the CSS
   * property. One `color` binding feeding both would render ink on ink.
   */
  containerColor = input<ContainerColorToken>();
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
  /**
   * Grow with the content up to this height, then scroll. The shape a dialog
   * body wants: as tall as the form until it would leave the viewport. With
   * `height` unset the area is otherwise content-sized and never scrolls.
   */
  maxHeight = input<OptionalValue>();
  /**
   * Take the room a flex-column parent leaves (`flex: 1 1 auto; min-height: 0`)
   * and scroll within it — the body of a dialog or drawer without a wrapper.
   */
  fill = input(false, { transform: booleanAttribute });
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

  /**
   * `maxHeight` and `fill` both size the host by something other than its own
   * content, and a `height: 100%` viewport cannot resolve against that — so
   * in either mode the host becomes a flex column and the viewport its one
   * shrinkable item. Content-sized and `height`-sized areas keep the block
   * layout they always had.
   */
  private readonly flexed = computed(() => this.fill() || this.maxHeight() !== undefined);

  protected readonly className = computed(() => {
    return css([
      {
        display: 'block',
        overflow: 'hidden',
        height: this.height(),
        width: this.width(),

        ...this.theme.colorPair(this.containerColor()),
        ...this.theme.radius(this.borderRadius()),
        ...this.theme.border(this.border()),
      },
      this.flexed() && {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: this.maxHeight(),
      },
      this.fill() && {
        flex: '1 1 auto',
        minHeight: 0,
      },
    ]);
  });

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
      // The one flex item of a `maxHeight`/`fill` host: it may shrink below
      // its content, which is what makes it scroll.
      this.flexed() && {
        height: 'auto',
        flex: '1 1 auto',
        minHeight: 0,
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
