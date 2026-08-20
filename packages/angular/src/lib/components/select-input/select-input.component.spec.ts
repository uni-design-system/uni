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
});
