/**
 * Valueless boolean attributes, across every component that offers one.
 *
 * A signal input with no transform binds a valueless attribute as the **empty
 * string**, which is falsy — so `<button text-button fullWidth>` compiles,
 * type-checks, reads as deliberate, and renders nothing. That is the worst
 * shape a defect can take: it looks exactly like the documented API and fails
 * silently.
 *
 * The assertion is on the **input's own value**, not only on the emitted CSS.
 * `uni-input`, `uni-textarea`, `uni-select` and `uni-input-box` forward
 * `fullWidth` down to `box-layout`, whose transform turns the empty string into
 * `true` at the end of the chain — so a CSS-only check passes whether or not
 * the component in the middle has its own transform, and guards nothing. It
 * still matters there: `fullWidth()` is typed `boolean`, and without the
 * transform it holds `''`, which is a lie to anyone who reads it.
 *
 * Not co-located, because the guard is the *sweep* rather than any one
 * component: one declaration losing its transform is the regression worth
 * catching, and six copies of this test would be six places to forget.
 * `forms/listbox-popup.spec.ts` sits in a shared home for the same reason.
 */
import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UniButtonComponent } from './button/button.component';
import { UniCheckboxComponent } from './checkbox/checkbox.component';
import { UniInputComponent } from './input/input.component';
import { UniInputBoxComponent } from './input-box/input-box.component';
import { UniRadioComponent } from './radio/radio.component';
import { UniSelectComponent } from './select-input/select-input.component';
import { UniTextareaComponent } from './textarea/textarea.component';
import { UniToggleComponent } from './toggle/toggle.component';
import { UniBoxDirective } from './layout/box/box.directive';
import { emittedRuleFor } from '../../testing/emitted-css';

interface Case {
  name: string;
  type: Type<unknown>;
  template: string;
  /** The element the component or directive sits on. */
  host: string;
  /** The element that carries the width rule — not always the host. */
  target: string;
  input?: 'fullWidth' | 'fullHeight';
  declaration?: string;
}

const cases: Case[] = [
  {
    name: 'uni-button',
    type: UniButtonComponent,
    template: `<button text-button fullWidth>Save</button>`,
    host: 'button',
    target: 'button',
  },
  {
    name: 'uni-checkbox',
    type: UniCheckboxComponent,
    template: `<uni-checkbox fullWidth label="Pick" />`,
    host: 'uni-checkbox',
    target: 'uni-checkbox',
  },
  {
    name: 'uni-toggle',
    type: UniToggleComponent,
    template: `<uni-toggle fullWidth label="Pick" />`,
    host: 'uni-toggle',
    target: 'uni-toggle',
  },
  {
    name: 'uni-radio',
    type: UniRadioComponent,
    template: `<uni-radio fullWidth [options]="[{ label: 'A', value: 'a' }]" />`,
    host: 'uni-radio',
    target: 'label',
  },
  {
    name: 'uni-input-box',
    type: UniInputBoxComponent,
    template: `<uni-input-box fullWidth />`,
    host: 'uni-input-box',
    // The host is `display: contents`, so the width lands on the row inside.
    target: 'uni-input-box > *',
  },
  {
    name: 'uni-input',
    type: UniInputComponent,
    template: `<uni-input fullWidth label="Name" />`,
    host: 'uni-input',
    target: 'uni-input-box > *',
  },
  {
    name: 'uni-textarea',
    type: UniTextareaComponent,
    template: `<uni-textarea fullWidth label="Notes" />`,
    host: 'uni-textarea',
    target: 'uni-input-box > *',
  },
  {
    name: 'uni-select',
    type: UniSelectComponent,
    template: `<uni-select fullWidth [options]="[]" />`,
    host: 'uni-select',
    target: 'uni-input-box > *',
  },
  {
    name: 'box-layout',
    type: UniBoxDirective,
    template: `<div box-layout fullWidth></div>`,
    host: 'div',
    target: 'div',
  },
  {
    name: 'box-layout fullHeight',
    type: UniBoxDirective,
    template: `<div box-layout fullHeight></div>`,
    host: 'div',
    target: 'div',
    input: 'fullHeight',
  },
];

describe('fullWidth as a bare attribute', () => {
  for (const { name, type, template, host, target, input = 'fullWidth' } of cases) {
    it(`${name} reads it as true`, async () => {
      const Host = Component({ selector: 'uni-test-host', imports: [type], template })(
        class TestHost {}
      );
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      // Own predicate rather than `By.directive` — the repo pulls in no
      // platform-browser testing helpers anywhere else.
      const found = fixture.debugElement.query((node) =>
        (node.nativeElement as HTMLElement | null)?.matches?.(host) === true
      );
      expect(found).not.toBeNull();

      const instance = found.injector.get(type) as Record<string, () => unknown>;
      expect(instance[input]()).toBe(true);

      const el = (fixture.nativeElement as HTMLElement).querySelector(target)!;
      expect(emittedRuleFor(el)).toContain(
        input === 'fullHeight' ? 'height:100%' : 'width:100%'
      );
    });
  }
});

/**
 * `uni-button`'s own pair. They are asserted through the host attributes rather
 * than the emitted CSS, because that is where they land: `disabled` is what
 * actually stops the click, and it is produced by
 * `disable() || loading() || null`.
 */
describe('uni-button disable and loading as bare attributes', () => {
  const render = async (template: string) => {
    const Host = Component({
      selector: 'uni-test-host',
      imports: [UniButtonComponent],
      template,
    })(class TestHost {});
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    const instance = fixture.debugElement
      .query((node) => (node.nativeElement as HTMLElement | null)?.matches?.('button') === true)
      .injector.get(UniButtonComponent);
    return { button, instance };
  };

  it('reads a bare `disable` as true, and disables the button', async () => {
    const { button, instance } = await render(`<button text-button disable>Save</button>`);
    expect(instance.disable()).toBe(true);
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('reads a bare `loading` as true, and marks the button busy', async () => {
    const { button, instance } = await render(`<button text-button loading>Save</button>`);
    expect(instance.loading()).toBe(true);
    // Loading disables as well — a request is already in flight.
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('uni-icon')).not.toBeNull();
  });

  it('leaves an unset button alone', async () => {
    const { button, instance } = await render(`<button text-button>Save</button>`);
    expect(instance.disable()).toBe(false);
    expect(instance.loading()).toBe(false);
    // `disable() || loading() || null` — null removes the attribute entirely,
    // rather than rendering `disabled="false"`, which the DOM reads as true.
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.hasAttribute('aria-busy')).toBe(false);
  });
});
