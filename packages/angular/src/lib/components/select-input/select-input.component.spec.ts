import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  describe('disabled options', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue', disabled: true },
      ]);
      fixture.detectChanges();
    });

    it('marks the option disabled so the browser skips it', () => {
      const rendered = Array.from(select().querySelectorAll('option'));
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
