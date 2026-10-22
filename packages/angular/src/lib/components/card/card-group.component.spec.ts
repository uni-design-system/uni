/**
 * `uni-card-group`: the wiring the group exists for — which card is selected,
 * which one holds the tab stop, and the radio keyboard model — asserted on
 * the projected cards' DOM. Colours belong to the `card` theme entry.
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniCardComponent } from './card.component';
import { UniCardGroupComponent } from './card-group.component';

@Component({
  imports: [UniCardComponent, UniCardGroupComponent],
  template: `
    <h2 id="heading">Kind of work</h2>
    <uni-card-group
      ariaLabelledBy="heading"
      [(value)]="value"
      [disabled]="disabled()"
      [invalid]="invalid()"
      [required]="required()"
      (activated)="activations.push($event)"
      (touch)="touches = touches + 1"
    >
      <uni-card value="custom">Custom work</uni-card>
      <uni-card value="catalog" [disabled]="catalogOff()">Catalog order</uni-card>
      <uni-card value="repair">Repair <input id="note" /></uni-card>
      <uni-card>Not an option</uni-card>
    </uni-card-group>
    <button id="outside">Outside</button>
  `,
})
class GroupHost {
  value = signal<string | null>(null);
  disabled = signal(false);
  invalid = signal(false);
  required = signal(false);
  catalogOff = signal(false);
  activations: string[] = [];
  touches = 0;
}

describe('UniCardGroupComponent', () => {
  let fixture: ComponentFixture<GroupHost>;
  let host: HTMLElement;

  const group = () => host.querySelector<HTMLElement>('uni-card-group')!;
  const radios = () => Array.from(host.querySelectorAll<HTMLElement>('[role="radio"]'));
  const checked = () => radios().map((r) => r.getAttribute('aria-checked'));
  const tabIndexes = () => radios().map((r) => r.getAttribute('tabindex'));
  /** A key from the frame holding the tab stop — where a real keypress lands. */
  const keydown = (key: string) => {
    const from = radios().find((r) => r.getAttribute('tabindex') === '0') ?? radios()[0];
    from.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  const settle = async () => {
    await Promise.resolve();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GroupHost] }).compileComponents();
    fixture = TestBed.createComponent(GroupHost);
    host = fixture.nativeElement;
    document.body.appendChild(host);
    fixture.detectChanges();
  });

  afterEach(() => host.remove());

  it('is a radiogroup named by its heading, and a card with a value is a radio', () => {
    expect(group().getAttribute('role')).toBe('radiogroup');
    expect(group().getAttribute('aria-labelledby')).toBe('heading');
    expect(radios()).toHaveLength(3);
    // A card without a value is content, not an option.
    expect(host.querySelectorAll('uni-card')).toHaveLength(4);
  });

  it('lays the cards out as a grid', () => {
    expect(getComputedStyle(group()).display).toBe('grid');
  });

  it('holds one tab stop, on the first enabled card until something is selected', () => {
    expect(tabIndexes()).toEqual(['0', '-1', '-1']);
    expect(checked()).toEqual(['false', 'false', 'false']);
  });

  it('a click selects: value, aria-checked, the tab stop and activated', () => {
    radios()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('repair');
    expect(checked()).toEqual(['false', 'false', 'true']);
    expect(tabIndexes()).toEqual(['-1', '-1', '0']);
    expect(fixture.componentInstance.activations).toEqual(['repair']);
  });

  it('follows a value set from outside, re-seating the tab stop', () => {
    fixture.componentInstance.value.set('catalog');
    fixture.detectChanges();
    expect(checked()).toEqual(['false', 'true', 'false']);
    expect(tabIndexes()).toEqual(['-1', '0', '-1']);
  });

  it('Space and Enter on the focused card select it', () => {
    for (const key of [' ', 'Enter']) {
      fixture.componentInstance.value.set(null);
      fixture.detectChanges();
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      radios()[0].dispatchEvent(event);
      fixture.detectChanges();
      expect(event.defaultPrevented).toBe(true);
      expect(fixture.componentInstance.value()).toBe('custom');
    }
  });

  it('arrows move focus and select, wrapping at the ends', async () => {
    keydown('ArrowRight');
    await settle();
    expect(fixture.componentInstance.value()).toBe('catalog');
    expect(document.activeElement).toBe(radios()[1]);

    keydown('ArrowRight');
    keydown('ArrowRight');
    await settle();
    expect(fixture.componentInstance.value()).toBe('custom');

    keydown('ArrowLeft');
    await settle();
    expect(fixture.componentInstance.value()).toBe('repair');
  });

  /**
   * Any arrow that bubbled up from inside a card used to move the selection
   * and the focus — the caret moving in an address field on a ship-to card
   * jumped to the next card and dropped the field.
   */
  it('leaves a key that started inside a card\'s content to the content', async () => {
    fixture.componentInstance.value.set('repair');
    fixture.detectChanges();
    const field = host.querySelector<HTMLInputElement>('#note')!;
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });
    field.dispatchEvent(event);
    await settle();
    expect(event.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.value()).toBe('repair');
  });

  it('a card that is an option is a grid host, so its frame fills the cell', () => {
    const cards = Array.from(host.querySelectorAll<HTMLElement>('uni-card'));
    expect(getComputedStyle(cards[0]).display).toBe('grid');
    // Plain content in the group is left as it was.
    expect(getComputedStyle(cards[3]).display).not.toBe('grid');
  });

  it('Home and End go to the first and last enabled card', async () => {
    keydown('End');
    await settle();
    expect(fixture.componentInstance.value()).toBe('repair');
    keydown('Home');
    await settle();
    expect(fixture.componentInstance.value()).toBe('custom');
  });

  it('skips a disabled card and never selects it', async () => {
    fixture.componentInstance.catalogOff.set(true);
    fixture.detectChanges();
    expect(radios()[1].getAttribute('aria-disabled')).toBe('true');

    keydown('ArrowRight');
    await settle();
    expect(fixture.componentInstance.value()).toBe('repair');

    radios()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('repair');
  });

  it('a disabled group selects nothing', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(group().getAttribute('aria-disabled')).toBe('true');
    radios()[0].click();
    keydown('ArrowRight');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('is touched once focus leaves the group, not while it moves within', () => {
    radios()[0].dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: radios()[1] })
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.touches).toBe(0);

    radios()[1].dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: host.querySelector('#outside') })
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.touches).toBe(1);
  });

  it('gates aria-invalid on touched, and reflects required', () => {
    fixture.componentInstance.invalid.set(true);
    fixture.componentInstance.required.set(true);
    fixture.detectChanges();
    expect(group().getAttribute('aria-invalid')).toBeNull();
    expect(group().getAttribute('aria-required')).toBe('true');

    radios()[0].dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: host.querySelector('#outside') })
    );
    fixture.detectChanges();
    expect(group().getAttribute('aria-invalid')).toBe('true');
  });

  it('draws the selected card with the card-selected class', () => {
    radios()[0].click();
    fixture.detectChanges();
    expect(radios()[0].classList.contains('card-selected')).toBe(true);
    expect(radios()[0].classList.contains('card-interactive')).toBe(true);
    expect(radios()[1].classList.contains('card-selected')).toBe(false);
  });
});
