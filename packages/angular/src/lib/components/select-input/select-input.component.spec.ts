import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UniSelectComponent } from './select-input.component';

describe('UniSelectComponent', () => {
  let fixture: ComponentFixture<UniSelectComponent<string>>;

  const options = [
    { label: 'Red', value: 'red' },
    { label: 'Blue', value: 'blue' },
  ];

  const select = (): HTMLSelectElement =>
    (fixture.nativeElement as HTMLElement).querySelector('select')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniSelectComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniSelectComponent<string>);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('ariaLabel', 'Favorite color');
    fixture.detectChanges();
  });

  it('exposes ariaLabel on the native select', () => {
    expect(select().getAttribute('aria-label')).toBe('Favorite color');
  });

  it('maps the selected index back to the option value', () => {
    select().value = '1';
    select().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('blue');
  });

  it('renders a preselected value', () => {
    fixture.componentRef.setInput('value', 'blue');
    fixture.detectChanges();
    expect(select().selectedIndex).toBe(1);
  });

  /**
   * A native <select> with no selected <option> displays its first entry. The
   * placeholder option used to be the only "nothing selected" row, so without
   * one a model of `''` or a stale id showed "Red" while holding something
   * else — and everything derived from the model stayed empty with no visible
   * reason.
   */
  describe('a value no option stands for, with no placeholder', () => {
    afterEach(() => vi.restoreAllMocks());

    const selectedOption = () => select().options[select().selectedIndex];

    it('renders as empty rather than as the first option', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('value', '');
      fixture.detectChanges();

      expect(select().value).toBe('-1');
      expect(selectedOption().hidden).toBe(true);
      expect(selectedOption().textContent?.trim()).toBe('');
      expect(warn).toHaveBeenCalledWith(
        '[uni-select] value "" matches no option — rendering as empty'
      );
    });

    it('treats an unknown value the same way, once per value', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('value', 'green');
      fixture.detectChanges();
      fixture.detectChanges();

      expect(select().value).toBe('-1');
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('renders null as empty without a warning', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('value', null);
      fixture.detectChanges();

      expect(select().value).toBe('-1');
      expect(warn).not.toHaveBeenCalled();
    });

    it('keeps the hidden row out of the list once a real option is selected', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('value', '');
      fixture.detectChanges();
      fixture.componentRef.setInput('value', 'blue');
      fixture.detectChanges();

      expect(select().options.length).toBe(2);
      expect(select().selectedIndex).toBe(1);
    });

    it('does not warn while the options are still loading', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('options', []);
      fixture.componentRef.setInput('value', 'blue');
      fixture.detectChanges();

      expect(warn).not.toHaveBeenCalled();
      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();
      expect(select().selectedIndex).toBe(1);
    });
  });

  describe('disabled options', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue', disabled: true },
      ]);
      fixture.detectChanges();
    });

    it('marks the option disabled so the browser skips it', () => {
      // The value is null here, so the hidden "nothing selected" row (itself
      // disabled) is rendered ahead of the real options.
      const rendered = Array.from(
        select().querySelectorAll<HTMLOptionElement>('option:not([hidden])')
      );
      expect(rendered.map((option) => option.disabled)).toEqual([false, true]);
    });

    it('leaves enabled options selectable', () => {
      select().value = '0';
      select().dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toBe('red');
    });
  });

  describe('object values', () => {
    let objFixture: ComponentFixture<UniSelectComponent<{ id: number }>>;

    beforeEach(() => {
      objFixture = TestBed.createComponent(UniSelectComponent<{ id: number }>);
      objFixture.componentRef.setInput('options', [
        { label: 'One', value: { id: 1 } },
        { label: 'Two', value: { id: 2 } },
      ]);
      objFixture.componentRef.setInput('ariaLabel', 'Number');
    });

    const objSelect = (): HTMLSelectElement =>
      (objFixture.nativeElement as HTMLElement).querySelector('select')!;

    it('matches a structurally-equal preselected value through compareWith', () => {
      objFixture.componentRef.setInput(
        'compareWith',
        (a: { id: number }, b: { id: number }) => a?.id === b?.id
      );
      objFixture.componentRef.setInput('value', { id: 2 });
      objFixture.detectChanges();
      expect(objSelect().selectedIndex).toBe(1);
    });
  });

  /**
   * `uni-icon` fills its container unless given an explicit size, where
   * `uni-symbol` always emitted 24px — so the symbol→icon migration left this
   * chevron stretching to the width of the select and centring itself. The
   * size also has to match `uni-combobox`, which is the same control shape.
   */
  it('sizes its chevron explicitly, matching uni-combobox', () => {
    const chevron = (fixture.nativeElement as HTMLElement).querySelector('uni-icon')!;

    expect(chevron).not.toBeNull();
    // `uni-icon` writes its resolved size to inline width/height, so this also
    // proves the `select.toggleSize` theme option reached it.
    expect((chevron as HTMLElement).style.width).toBe('20px');
    expect((chevron as HTMLElement).style.height).toBe('20px');
  });
});
