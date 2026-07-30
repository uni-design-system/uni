import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { css } from '@emotion/css';
import { motionSafe } from '../../cdk';
import { UniIconComponent } from '../icon/icon.component';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniTextComponent } from '../text/text.component';
import { UniTooltipComponent } from '../tooltip/tooltip.component';

/**
 * Trigger for a {@link UniExpandComponent} region.
 *
 * Two shapes, chosen by whether `label` is set:
 * - **Icon only** (default) — the bare chevron, sized for a Card Header.
 * - **Labelled** — chevron plus a label and optional muted sublabel, as a
 *   single full-width button. Most real disclosures need a name for the
 *   section, and building that row by hand is the thing this saves; it also
 *   makes the label the button's accessible name rather than adjacent text.
 */
@Component({
  selector: 'uni-expand-toggle',
  imports: [UniIconComponent, UniIconButtonComponent, UniTextComponent, UniTooltipComponent],
  template: `
    @if (label()) {
      <button
        type="button"
        [class]="triggerClassName"
        (click)="toggle()"
        [attr.aria-expanded]="!collapsed()"
        [attr.aria-controls]="ariaControls() || null"
      >
        <uni-icon name="chevronUp" size="1em" />
        <span [class]="labelClassName">
          <span uni-text="label">{{ label() }}</span>
          @if (sublabel()) {
            <span uni-text="caption" color="on-background-variant">{{ sublabel() }}</span>
          }
        </span>
      </button>
    } @else {
      <uni-tooltip [label]="collapsed() ? 'Expand' : 'Collapse'" placement="right">
        <button
          icon-button
          iconName="chevronUp"
          (click)="toggle()"
          [attr.aria-expanded]="!collapsed()"
          [attr.aria-controls]="ariaControls() || null"
        >
          {{ collapsed() ? 'Expand' : 'Collapse' }}
        </button>
      </uni-tooltip>
    }
  `,
  host: {
    '[class]': 'className()',
    '[attr.toggled]': 'collapsed() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniExpandToggleComponent {
  collapsed = model(true);

  /** Id of the Expand region this toggle controls (see UniExpandComponent.regionId). */
  ariaControls = input<string>();

  /** Names the region. Setting it switches the toggle to its labelled shape. */
  label = input<string>();

  /** Muted qualifier beside the label ("for POs & custom orders"). Needs `label`. */
  sublabel = input<string>();

  /**
   * The glyph rotates, never the host.
   *
   * The host is the tooltip's positioning box — `uni-tooltip` puts its
   * `anchor-name` on its own element, nested inside ours — so rotating the
   * host swings the anchor through the turn and the bubble visibly bobs. The
   * host is also taller than the glyph (an inline-level box reserves baseline
   * descender space), so spinning it about its own centre walks the glyph
   * off-centre. `uni-icon` is a centred square sized to the glyph, which makes
   * it the only box here that rotates symmetrically. It also keeps a label
   * from turning upside down with the chevron.
   */
  private readonly glyphStyles = computed(() => ({
    '& uni-icon': {
      flexShrink: 0,
      ...motionSafe({ transition: 'transform 350ms ease-in-out' }),
      transform: this.collapsed() ? 'rotate(-180deg)' : 'rotate(0)',
    },
  }));

  protected readonly className = computed(() => {
    if (this.label()) {
      return css({ display: 'block', ...this.glyphStyles() });
    }

    return css({
      display: 'inline-flex',
      cursor: 'pointer',
      ...this.glyphStyles(),
    });
  });

  protected readonly triggerClassName = css({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: 0,
    border: 0,
    background: 'none',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
  });

  protected readonly labelClassName = css({
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    minWidth: 0,
  });

  toggle() {
    this.collapsed.update((collapsed) => !collapsed);
  }
}
