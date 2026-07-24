import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniSymbolComponent } from '../symbol';
import type { BreadcrumbItem, UniBreadcrumbOptions } from './breadcrumb.model';

/**
 * WAI-ARIA breadcrumb: a `nav` landmark wrapping an ordered list; the last
 * item is the current page (`aria-current="page"`), separators are decorative.
 * Items with `href` render as real links; without one they render as
 * link-styled buttons emitting `itemClicked` — wire that to your router.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-breadcrumb, Breadcrumb',
  imports: [UniSymbolComponent],
  providers: [{ provide: COMPONENT_NAME, useValue: 'breadcrumb' }],
  template: `
    <nav [attr.aria-label]="ariaLabel()" [class]="className()">
      <ol>
        @for (item of items(); track item.label; let last = $last; let i = $index) {
          <li>
            @if (last) {
              <span aria-current="page">{{ item.label }}</span>
            } @else if (item.href) {
              <a [href]="item.href" (click)="itemClicked.emit(item)">{{ item.label }}</a>
            } @else {
              <button type="button" (click)="itemClicked.emit(item)">{{ item.label }}</button>
            }
            @if (!last) {
              <Symbol
                aria-hidden="true"
                [name]="componentOptions().separatorSymbol ?? 'chevron_right'"
              />
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class UniBreadcrumbComponent extends BaseComponent<UniBreadcrumbOptions> {
  /** The trail, root first; the last item is the current page. */
  items = input.required<BreadcrumbItem[]>();
  /** Landmark label distinguishing this nav from others on the page. */
  ariaLabel = input('Breadcrumb');

  /** Emits the clicked ancestor item (also fires for `href` links). */
  itemClicked = output<BreadcrumbItem>();

  protected readonly className = computed(() => {
    const options = this.componentOptions();
    const linkColor = this.theme.colors()[options.color ?? 'on-background-variant'];
    return css({
      '& ol': {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        ...this.theme.typeface(options.typeface),
      },
      '& li': {
        display: 'inline-flex',
        alignItems: 'center',
        ...this.theme.gap(options.gap),
      },
      '& a, & button': {
        background: 'none',
        border: 0,
        padding: 0,
        font: 'inherit',
        cursor: 'pointer',
        textDecoration: 'none',
        color: linkColor,
        '&:hover': { textDecoration: 'underline' },
        '&:focus-visible': {
          outline: `2px solid ${this.theme.colors()['primary']}`,
          outlineOffset: 2,
        },
      },
      '& [aria-current]': {
        ...this.theme.color(options.currentColor),
      },
      '& symbol': { fontSize: '1.1em', ...this.theme.color(options.color) },
      ...this.theme.gap(options.gap),
    });
  });
}
