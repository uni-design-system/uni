import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniSymbolComponent } from '../symbol';
import type { UniAvatarOptions } from './avatar.model';

/**
 * Identity avatar with a graceful fallback chain: image → initials from
 * `name` → themed symbol. Coloring, radius, typeface and sizes all resolve
 * from `avatar` theme tokens; `variant` picks the container palette.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-avatar, Avatar',
  imports: [UniSymbolComponent],
  providers: [{ provide: COMPONENT_NAME, useValue: 'avatar' }],
  host: {
    '[class]': 'className()',
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
  },
  template: `
    @if (showImage()) {
      <img [src]="src()" alt="" (error)="imageFailed.set(true)" />
    } @else if (text()) {
      <span>{{ text() }}</span>
    } @else if (initials()) {
      <span>{{ initials() }}</span>
    } @else {
      <Symbol [name]="componentOptions().fallbackSymbol ?? 'person'" />
    }
  `,
})
export class UniAvatarComponent extends BaseComponent<UniAvatarOptions> {
  /** Image URL; on load error the avatar falls back to initials/symbol. */
  src = input<string>();
  /** Person's name: drives the initials and the accessible label. */
  name = input<string>();
  /** Verbatim text instead of derived initials (e.g. a group's “+3”). */
  text = input<string>();

  protected readonly imageFailed = signal(false);

  protected readonly showImage = computed(() => !!this.src() && !this.imageFailed());

  protected readonly initials = computed(() => {
    const name = this.name()?.trim();
    if (!name) return '';
    const words = name.split(/\s+/);
    const first = words[0]?.[0] ?? '';
    const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
    return (first + last).toUpperCase();
  });

  protected readonly label = computed(() => this.name() ?? this.text());

  protected readonly className = computed(() =>
    css([
      // Typeface (family/weight) before the merged theme style, so the size
      // record's fontSize wins over the typeface's.
      {
        ...this.theme.typeface(this.componentOptions().typeface),
        ...this.theme.radius(this.componentOptions().borderRadius),
      },
      this.style(),
      {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
        overflow: 'hidden',
        userSelect: 'none',
        lineHeight: 1,
        '& img': { width: '100%', height: '100%', objectFit: 'cover' },
        '& symbol': { fontSize: '1.4em' },
      },
    ])
  );
}
