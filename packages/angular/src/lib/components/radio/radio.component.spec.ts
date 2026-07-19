import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniRadioComponent } from './radio.component';

describe('UniRadioComponent', () => {
  let fixture: ComponentFixture<UniRadioComponent>;

  const options = [
    { label: 'One', value: 'one' },
    { label: 'Two', value: 'two' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniRadioComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniRadioComponent);
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();
  });

  it('renders a labelled radiogroup', () => {
    fixture.componentRef.setInput('label', 'Choose one');
    fixture.detectChanges();

    const group = (fixture.nativeElement as HTMLElement).querySelector('[role="radiogroup"]')!;
    expect(group).not.toBeNull();
    const labelledBy = group.getAttribute('aria-labelledby')!;
    expect(labelledBy).toBeTruthy();
    expect(
      document.getElementById(labelledBy) ?? group.querySelector(`#${labelledBy}`)
    ).toBeTruthy();
  });

  it('generates a unique group name per instance', () => {
    const second = TestBed.createComponent(UniRadioComponent);
    second.componentRef.setInput('options', options);
    second.detectChanges();

    const nameOf = (f: ComponentFixture<UniRadioComponent>) =>
      (f.nativeElement as HTMLElement).querySelector('input[type="radio"]')!.getAttribute('name');

    expect(nameOf(fixture)).toBeTruthy();
    expect(nameOf(fixture)).not.toBe(nameOf(second));
  });

  it('updates the value model and touched state on selection', () => {
    const radios = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>(
      'input[type="radio"]'
    );
    radios[1].checked = true;
    radios[1].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('two');
    expect(fixture.componentInstance.touched()).toBe(true);
  });
});
