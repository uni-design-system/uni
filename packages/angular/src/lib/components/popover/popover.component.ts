import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { css } from '@emotion/css';
import { ThemeService } from '../../theming';
import {
  anchorArrowStyles,
  anchorStyles,
  newAnchorName,
  resolveFocusTarget,
  uniqueId,
  type Placement,
} from '../../cdk';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-popover, Popover',
  imports: [],
  templateUrl: './popover.component.html',
})
export class UniPopoverComponent {
  private renderer = inject(Renderer2);
  private theme = inject(ThemeService);

  placement = input<Placement>('bottom');

  /** Light-dismiss on outside click / Escape (native popover="auto"). */
  autoClose = input(true);

  readonly panelId = uniqueId('uni-popover');
  private readonly anchorName = newAnchorName();
  private readonly showing = signal(false);

  private triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private panelRef = viewChild.required<ElementRef<HTMLElement>>('panel');

  constructor() {
    // Wire the ARIA disclosure contract onto the focusable trigger element
    afterNextRender(() => {
      const target = resolveFocusTarget(this.triggerRef().nativeElement);
      this.renderer.setAttribute(target, 'aria-expanded', 'false');
      this.renderer.setAttribute(target, 'aria-controls', this.panelId);
    });
  }

  protected onToggle(event: Event) {
    const open = (event as ToggleEvent).newState === 'open';
    this.showing.set(open);
    this.renderer.setAttribute(
      resolveFocusTarget(this.triggerRef().nativeElement),
      'aria-expanded',
      `${open}`
    );
  }

  showPopover() {
    this.panelRef().nativeElement.showPopover();
  }

  hidePopover() {
    this.panelRef().nativeElement.hidePopover();
  }

  togglePopover(event: MouseEvent) {
    if (this.showing()) {
      this.hidePopover();
    } else {
      this.showPopover();
    }
    event.stopPropagation();
  }

  protected readonly triggerClassName = css({
    display: 'inline-block',
    anchorName: this.anchorName,
  });

  protected readonly popoverClassName = computed(() =>
    css([
      {
        ...this.theme.colorPair('primary-surface'),
        ...this.theme.radius('xs'),
        ...this.theme.boxShadow('raised'),
        ...this.theme.typeface('label'),
        ...this.theme.border('quaternary'),
        padding: '6px 12px',
        width: 'max-content',
        overflow: 'visible',
        ...anchorStyles(this.anchorName, this.placement(), { mainAxis: 7 }),

        // Fade via discrete transitions across the top layer
        transitionProperty: 'opacity, display, overlay',
        transitionDuration: '250ms',
        transitionBehavior: 'allow-discrete',
        opacity: 0,

        '&:popover-open': {
          opacity: 1,
        },

        '@starting-style': {
          '&:popover-open': {
            opacity: 0,
          },
        },
      },
    ])
  );

  protected readonly arrowClassName = computed(() => {
    const side = this.placement().split('-')[0];
    // Border on the two edges of the rotated square that face outward
    const borders: Record<string, object> = {
      top: { ...this.theme.borderRight('quaternary'), ...this.theme.borderBottom('quaternary') },
      bottom: { ...this.theme.borderLeft('quaternary'), ...this.theme.borderTop('quaternary') },
      left: { ...this.theme.borderRight('quaternary'), ...this.theme.borderTop('quaternary') },
      right: { ...this.theme.borderLeft('quaternary'), ...this.theme.borderBottom('quaternary') },
    };
    return css({
      ...this.theme.colorPair('primary-surface'),
      ...anchorArrowStyles(this.placement()),
      ...borders[side],
    });
  });
}
