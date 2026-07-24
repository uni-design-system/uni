import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  model,
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
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-tabs, Tabs',
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
      ...motionSafe({ transition: 'color 0.15s ease, border-color 0.15s ease' }),
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
      ...this.theme.paddingTop('md'),
      '&:focus-visible': {
        outline: `2px solid ${this.theme.colors()[this.componentOptions().indicatorColor ?? 'primary']}`,
        outlineOffset: 2,
      },
    })
  );
}
