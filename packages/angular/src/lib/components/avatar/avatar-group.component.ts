import { ChangeDetectionStrategy, Component, computed, contentChildren, input } from '@angular/core';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniAvatarComponent } from './avatar.component';
import type { UniAvatarGroupOptions } from './avatar.model';

/**
 * Overlapping stack of avatars. `max` collapses the overflow into a themed
 * “+N” chip (itself a `uni-avatar`). Overlap and separator ring resolve from
 * `avatarGroup` theme tokens.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-avatar-group, AvatarGroup',
  imports: [UniAvatarComponent],
  providers: [{ provide: COMPONENT_NAME, useValue: 'avatarGroup' }],
  host: { '[class]': 'className()', role: 'group' },
  template: `
    <ng-content />
    @if (surplus() > 0) {
      <uni-avatar
        class="uni-surplus"
        [text]="'+' + surplus()"
        variant="quaternary"
        [size]="size()"
      />
    }
  `,
})
export class UniAvatarGroupComponent extends BaseComponent<UniAvatarGroupOptions> {
  /** Show at most this many avatars; the rest collapse into a “+N” chip. */
  max = input<number | undefined>(undefined);

  private readonly avatars = contentChildren(UniAvatarComponent);

  protected readonly surplus = computed(() => {
    const max = this.max();
    if (max === undefined) return 0;
    return Math.max(0, this.avatars().length - max);
  });

  protected readonly className = computed(() => {
    const options = this.componentOptions();
    const overlap = this.theme.spacing()[options.overlap ?? 'sm'] ?? '8px';
    const ring = `${options.ringWidth ?? 2}px solid ${
      this.theme.colors()[options.ringColor ?? 'surface'] ?? 'transparent'
    }`;
    const max = this.max();
    return css({
      display: 'inline-flex',
      alignItems: 'center',
      '& uni-avatar': {
        border: ring,
        marginLeft: `calc(-1 * ${overlap})`,
        '&:first-child': { marginLeft: 0 },
      },
      // Collapse the overflow: hide projected avatars past `max`, but never
      // the surplus chip this component renders itself.
      ...(max !== undefined && {
        [`& uni-avatar:nth-of-type(n + ${max + 1}):not(.uni-surplus)`]: { display: 'none' },
      }),
    });
  });
}
