import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  model,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { motionSafe } from '../../cdk';
import { UniTabComponent } from './tab.component';
import type { UniTabsOptions } from './tabs.model';

/**
 * WAI-ARIA tabs: roving tabindex, automatic activation (arrow keys move focus
 * and select), Home/End, disabled tabs skipped. Only the selected panel is
 * instantiated. All styling resolves from `tabs` theme option tokens.
 *
 * A tab switch is softened by the `panelMotion` option: the incoming content
 * fades in while the panel animates from the outgoing content's height to its
 * own. The new content is live from the first frame — nothing waits on the
 * animation.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-tabs',
  imports: [NgTemplateOutlet],
  providers: [{ provide: COMPONENT_NAME, useValue: 'tabs' }],
  template: `
    <!-- Roving-tabindex composite: focus lives on the tab buttons; keydown
         bubbles to the tablist, which itself must stay out of the tab order. -->
    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
    <div role="tablist" [class]="tablistClass()" (keydown)="onKeydown($event)">
      @for (tab of tabs(); track tab.id; let i = $index) {
        <button
          #tabButton
          type="button"
          role="tab"
          [id]="tab.id"
          [class]="tabClass()"
          [attr.aria-selected]="i === activeIndex()"
          [attr.aria-controls]="tab.panelId"
          [attr.tabindex]="i === activeIndex() ? 0 : -1"
          [disabled]="tab.disabled()"
          [class.active]="i === activeIndex()"
          (click)="select(i)"
        >
          {{ tab.label() }}
        </button>
      }
    </div>
    @if (activeTab(); as tab) {
      <div
        #panel
        role="tabpanel"
        [id]="tab.panelId"
        [attr.aria-labelledby]="tab.id"
        tabindex="0"
        [class]="panelClass()"
      >
        <ng-container [ngTemplateOutlet]="tab.content()" />
      </div>
    }
  `,
})
export class UniTabsComponent extends BaseComponent<UniTabsOptions> {
  /** Index of the selected tab; two-way bindable. */
  readonly selectedIndex = model(0);

  protected readonly tabs = contentChildren(UniTabComponent);
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  /** The selection, snapped to the nearest enabled tab. */
  protected readonly activeIndex = computed(() => {
    const tabs = this.tabs();
    const wanted = this.selectedIndex();
    if (tabs[wanted] && !tabs[wanted].disabled()) return wanted;
    const firstEnabled = tabs.findIndex((tab) => !tab.disabled());
    return firstEnabled === -1 ? 0 : firstEnabled;
  });

  protected readonly activeTab = computed(() => this.tabs()[this.activeIndex()]);

  protected select(index: number): void {
    if (this.tabs()[index]?.disabled()) return;
    this.selectedIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const enabled = this.tabs()
      .map((tab, index) => ({ tab, index }))
      .filter(({ tab }) => !tab.disabled())
      .map(({ index }) => index);
    if (enabled.length === 0) return;

    const position = enabled.indexOf(this.activeIndex());
    let next: number | undefined;
    switch (event.key) {
      case 'ArrowRight':
        next = enabled[(position + 1) % enabled.length];
        break;
      case 'ArrowLeft':
        next = enabled[(position - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        next = enabled[0];
        break;
      case 'End':
        next = enabled[enabled.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    this.select(next);
    this.tabButtons()[next]?.nativeElement.focus();
  }

  /** The outgoing content's height, captured just before a switch renders. */
  private outgoingHeight: number | undefined;
  private panelAnimation: Animation | undefined;

  constructor() {
    super();
    // A component effect flushes before its template is refreshed, so the
    // panel still holds the outgoing content here. Mid-animation this reads
    // the animated height, which is what lets a rapid second switch pick up
    // from where the first one had got to instead of jumping.
    effect(() => {
      this.activeTab();
      this.outgoingHeight = untracked(this.panel)?.nativeElement.getBoundingClientRect().height;
    });
    afterRenderEffect(() => {
      this.activeTab();
      untracked(() => this.animatePanel());
    });
  }

  /**
   * Fades the incoming content in while the panel travels from the outgoing
   * height to its own. Web Animations rather than a CSS transition: `auto` to
   * `auto` has nothing to interpolate, and an animation leaves no inline
   * height behind, so the panel is back to sizing itself the moment it ends.
   */
  private animatePanel(): void {
    const from = this.outgoingHeight;
    const panel = this.panel()?.nativeElement;
    if (!panel) return;
    try {
      // Cancel first: the measurement below must see the natural height.
      this.panelAnimation?.cancel();
      this.panelAnimation = undefined;
      const motion = this.panelMotion();
      // No outgoing height means first render — nothing to soften.
      if (from === undefined || !motion?.duration) return;
      // The global reduced-motion rule only reaches CSS; WAAPI must ask.
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const to = panel.getBoundingClientRect().height;
      this.panelAnimation = panel.animate?.(
        [
          { height: `${from}px`, opacity: 0, overflow: 'clip' },
          { height: `${to}px`, opacity: 1, overflow: 'clip' },
        ],
        { duration: motion.duration, easing: motion.easing }
      );
    } catch {
      // animation is decoration; environments without WAAPI just skip it
    }
  }

  /** Resolved from `panelMotion`; unset switches panels instantly. */
  private readonly panelMotion = computed(() => {
    const token = this.componentOptions().panelMotion;
    return token ? this.theme.motion(token) : undefined;
  });

  /** Resolved from the component's `motion` option; `snap` by default. */
  private readonly motion = computed(() =>
    this.theme.motion(this.componentOptions().motion ?? 'snap')
  );

  protected readonly tablistClass = computed(() => {
    const options = this.componentOptions();
    return css({
      display: 'flex',
      alignItems: 'stretch',
      ...this.theme.gap(options.gap),
      ...this.theme.borderBottom(options.divider),
    });
  });

  protected readonly tabClass = computed(() => {
    const options = this.componentOptions();
    const thickness = options.indicatorThickness
      ? this.theme.getThickness(options.indicatorThickness)
      : 2;
    return css({
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      // The indicator overlays the divider: reserve its thickness on every
      // tab so labels don't shift when selection moves.
      borderBottom: `${thickness}px solid transparent`,
      marginBottom: -1,
      ...this.theme.typeface(options.typeface),
      ...this.theme.color(options.textColor),
      ...this.theme.paddingLeft(options.padding),
      ...this.theme.paddingRight(options.padding),
      ...this.theme.paddingTop('sm'),
      ...this.theme.paddingBottom('sm'),
      ...this.theme.radius(options.borderRadius),
      ...motionSafe({
        transition:
          `color ${this.motion().duration}ms ${this.motion().easing},` +
          ` border-color ${this.motion().duration}ms ${this.motion().easing}`,
      }),
      '&.active': {
        ...this.theme.color(options.activeTextColor),
        ...this.theme.backgroundColor(options.activeColor),
        borderBottomColor: this.theme.colors()[options.indicatorColor ?? 'primary'],
      },
      '&:disabled': {
        ...this.theme.color('on-disabled'),
        cursor: 'not-allowed',
      },
      '&:focus-visible': {
        outline: `2px solid ${this.theme.colors()[options.indicatorColor ?? 'primary']}`,
        outlineOffset: -2,
      },
    });
  });

  protected readonly panelClass = computed(() =>
    css({
      '&:focus-visible': {
        outline: `2px solid ${this.theme.colors()[this.componentOptions().indicatorColor ?? 'primary']}`,
        outlineOffset: 2,
      },
    })
  );
}
