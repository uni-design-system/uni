import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniSliderComponent } from './slider.component';

describe('UniSliderComponent', () => {
  let fixture: ComponentFixture<UniSliderComponent>;

  const slider = (): HTMLInputElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input[type="range"]')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniSliderComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniSliderComponent);
    fixture.componentRef.setInput('label', 'Volume');
    fixture.detectChanges();
  });

  it('renders a labelled native range input', () => {
    expect(slider().getAttribute('aria-label')).toBe('Volume');
    expect(slider().min).toBe('0');
    expect(slider().max).toBe('100');
  });

  it('updates the value model on input and marks touched on blur', () => {
    slider().value = '40';
    slider().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(40);

    slider().dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('exposes the fill percentage as a custom property, respecting min/max', () => {
    fixture.componentRef.setInput('min', 50);
    fixture.componentRef.setInput('max', 150);
    fixture.componentInstance.value.set(75);
    fixture.detectChanges();
    expect(slider().style.getPropertyValue('--uni-slider-fill')).toBe('25%');
  });

  it('clamps the fill for out-of-range values', () => {
    fixture.componentInstance.value.set(999);
    fixture.detectChanges();
    expect(slider().style.getPropertyValue('--uni-slider-fill')).toBe('100%');
  });
});
