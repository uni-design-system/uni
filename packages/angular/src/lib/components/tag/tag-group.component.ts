import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { css } from '@emotion/css';
import type { Size, TagTone, Variant } from '@uni-design-system/uni-core';

import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniTagComponent } from './tag.component';
import type { UniTagGroupItem, UniTagGroupOptions, UniTagValue } from './tag.model';

/**
 * A row of chips the user picks from: filters, facets, a set of labels.
 *
 * The group **renders its own chips** from `items` rather than projecting them.
 * That is what lets it own the things an app was otherwise wiring per chip —
 * which one is selected, which one holds the tab stop — since a parent cannot
 * write a projected child's inputs. `uni-tag` is unchanged by this component;
 * `controlTabIndex` was already its hook for a composite that manages focus.
 *
 * Keyboard model is the toolbar pattern: one tab stop for the whole group, and
 * the arrow keys move within it. Twelve filter chips should cost one Tab to
 * pass, not twelve.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-tag-group',
  imports: [UniTagComponent],
  providers: [{ provide: COMPONENT_NAME, useValue: 'tagGroup' }],
  host: {
    '[class]': 'hostClass()',
    role: 'toolbar',
    'aria-orientation': 'horizontal',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    @for (item of items(); track item.value; let i = $index) {
      <uni-tag
        #chip
        [interactive]="true"
        [label]="item.label"
        [value]="item.value"
        [variant]="item.variant ?? resolvedVariant()"
        [tone]="item.tone ?? resolvedTone()"
        [size]="resolvedSize()"
        [selected]="isSelected(item.value)"
        [disabled]="item.disabled ?? false"
        [removable]="item.removable ?? false"
        [iconName]="item.iconName"
        [symbolName]="item.symbolName"
        [avatarSrc]="item.avatarSrc"
        [avatarName]="item.avatarName"
        [dot]="item.dot ?? false"
        [maxWidth]="item.maxWidth"
        [controlTabIndex]="i === focusedIndex() ? 0 : -1"
        (activated)="toggle(item)"
        (removed)="removed.emit(item.value)"
      />
    }
    @if (layout() === 'justify' && wrapped()) {
      <!-- Justification filler. It can only ever land on the last line, where
           it swallows the slack — so filled rows stretch flush and the last one
           keeps its natural widths, the way justified text behaves.

           It is only in the DOM once the group has actually wrapped. A single
           row is technically all last line, and leaving it ragged there means
           justification visibly does nothing until the row overflows — so the
           rule is measured rather than assumed. -->
      <i aria-hidden="true" [class]="fillerClass()"></i>
    }
  `,
})
export class UniTagGroupComponent<
  T extends UniTagValue = UniTagValue,
> extends BaseComponent<UniTagGroupOptions> {
  constructor() {
    super();
    const destroyRef = inject(DestroyRef);
    const host = inject(ElementRef<HTMLElement>);

    afterNextRender(() => {
      // The host is a wrapping flex row, so its height is the row count: any
      // change of rows — a resize, chips added or removed, a label that grew —
      // resizes the host and re-runs this.
      const observer = new ResizeObserver(() => this.measureRows());
      observer.observe(host.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());

      this.measureRows();
    });
  }

  items = input<readonly UniTagGroupItem<T>[]>([]);

  /**
   * `wrap` lets chips keep their natural widths. `justify` stretches each row
   * flush to both edges; once the group wraps, the last row is left ragged, the
   * way justified text leaves its last line alone. Chips put the extra width
   * around their labels, so tucked leads and remove controls stay tucked.
   *
   * Whether a group has wrapped is measured, not configured: the same group is
   * one row on a desktop and three on a phone, so a flag would be wrong at one
   * of those widths.
   */
  layout = input<'wrap' | 'justify'>('wrap');

  /** Allow more than one chip at a time. Single select replaces instead. */
  multiple = input(false);

  /**
   * The selected values — one array in both modes, as `uni-tag-input` keeps one
   * array for its items. Single select simply never holds more than one, which
   * spares callers a `T[] | T | null` union at every call site.
   */
  value = model<T[]>([]);

  /** The chip the user just activated, selected or deselected. */
  activated = output<T | undefined>();
  removed = output<T | undefined>();

  // Chip presentation. Named for the chips rather than inherited from
  // `BaseComponent`, because each one falls back to a `tagGroup` theme option
  // when it is absent — the group's own `variant`/`size` carry no meaning here,
  // since a group has no colour of its own and themes no variants.
  chipTone = input<TagTone | undefined>(undefined);
  chipSize = input<Size | undefined>(undefined);
  chipVariant = input<Variant | undefined>(undefined);

  protected readonly resolvedTone = computed(
    () => this.chipTone() ?? this.componentOptions().chipTone ?? 'soft'
  );
  protected readonly resolvedSize = computed(
    () => this.chipSize() ?? this.componentOptions().chipSize ?? 'md'
  );
  protected readonly resolvedVariant = computed(
    () => this.chipVariant() ?? this.componentOptions().chipVariant ?? 'primary'
  );

  /**
   * Which chip holds the group's tab stop. It moves with the arrow keys and
   * follows selection, so tabbing back into the group lands where the user
   * left off rather than at the start.
   */
  protected readonly focusedIndex = signal(0);

  // `read: ElementRef` — a `#chip` ref on a component element otherwise hands
  // back the component instance, which has no DOM node to focus.
  private readonly chipRefs = viewChildren('chip', { read: ElementRef });

  /** Set once the chips occupy more than one row. */
  protected readonly wrapped = signal(false);

  protected readonly fillerClass = computed(() => {
    const gap = this.theme.getSpacing(this.componentOptions().gap ?? 'xs');
    return css({
      flex: '10000 0 0',
      // Zero basis makes the filler weightless when flex breaks lines — but the
      // gap in front of it is not weightless, and on a row that happens to be
      // exactly full it is enough to push the filler onto a line of its own.
      // Pulling that gap back keeps the filler's whole footprint at zero.
      marginInlineStart: gap ? `calc(-1 * ${typeof gap === 'number' ? `${gap}px` : gap})` : 0,
    });
  });

  protected readonly hostClass = computed(() => {
    const options = this.componentOptions();

    return css([
      // Theme `fixed` carries the flex row; the entry themes no variants and no
      // sizes, since the chips own every colour and geometry decision.
      { ...this.style() },
      { ...this.theme.gap(options.gap ?? 'xs') },
      { rowGap: this.theme.getSpacing(options.rowGap ?? 'xs') },
      this.layout() === 'justify' && {
        // `auto` basis, not `0`: a stretched chip grows from its own content
        // width, so a long label still gets more room than a short one.
        '& > uni-tag': { flex: '1 1 auto', minWidth: 0 },
      },
    ]);
  });

  protected isSelected(value: T): boolean {
    return this.value().includes(value);
  }

  protected toggle(item: UniTagGroupItem<T>): void {
    const selected = this.isSelected(item.value);

    this.value.update((current) => {
      if (selected) return current.filter((value) => value !== item.value);
      return this.multiple() ? [...current, item.value] : [item.value];
    });

    this.focusedIndex.set(this.items().findIndex((candidate) => candidate.value === item.value));
    this.activated.emit(item.value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const last = this.items().length - 1;
    if (last < 0) return;

    // Both axes: the row wraps, so Down from the first line is as natural a
    // "next chip" as Right is.
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.focusChip(Math.min(this.focusedIndex() + 1, last));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.focusChip(Math.max(this.focusedIndex() - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.focusChip(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusChip(last);
        break;
    }
  }

  /**
   * Row count from the chips' offsets, so `justify` can tell a single row from
   * a wrapped one.
   *
   * Safe to run at any time and in any order: flex breaks lines from each
   * item's basis *before* it grows anything, so neither the filler (zero basis,
   * zero margin) nor the growth this decision enables can change which row a
   * chip lands on. The measurement cannot chase its own tail.
   */
  private measureRows(): void {
    const tops = this.chipRefs().map((chip) => (chip.nativeElement as HTMLElement).offsetTop);
    const wrapped = new Set(tops).size > 1;
    if (wrapped !== this.wrapped()) this.wrapped.set(wrapped);
  }

  private focusChip(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.items().length - 1));
    this.focusedIndex.set(clamped);
    // The tab index the chip reads is a binding, so let it settle before
    // moving focus — the same ordering `uni-tag-input` uses.
    queueMicrotask(() => {
      const chip = this.chipRefs()[clamped]?.nativeElement as HTMLElement | undefined;
      chip?.querySelector<HTMLElement>('button')?.focus();
    });
  }
}
