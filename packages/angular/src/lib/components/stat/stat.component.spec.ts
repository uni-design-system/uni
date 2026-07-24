import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniStatComponent } from './stat.component';

describe('UniStatComponent', () => {
  let fixture: ComponentFixture<UniStatComponent>;

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const text = (selector: string): string =>
    host().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniStatComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniStatComponent);
    fixture.componentRef.setInput('label', 'Monthly recurring revenue');
    fixture.componentRef.setInput('value', '$48.2K');
    fixture.detectChanges();
  });

  it('renders label and verbatim string values', () => {
    expect(text('.uni-stat-label')).toBe('Monthly recurring revenue');
    expect(text('.uni-stat-value')).toBe('$48.2K');
  });

  it('auto-compacts numeric values', () => {
    fixture.componentRef.setInput('value', 48234);
    fixture.detectChanges();
    expect(text('.uni-stat-value')).toBe('48.2K');
  });

  it('colors the delta by direction × goodness, not direction alone', () => {
    fixture.componentRef.setInput('delta', '-0.4%');
    fixture.componentRef.setInput('upIsGood', false); // churn: down is good
    fixture.detectChanges();
    const delta = host().querySelector('.uni-stat-delta')!;
    expect(delta.classList.contains('good')).toBe(true);

    fixture.componentRef.setInput('upIsGood', true);
    fixture.detectChanges();
    expect(delta.classList.contains('good')).toBe(false);
  });

  it('announces direction in words alongside the arrow glyph', () => {
    fixture.componentRef.setInput('delta', '+12.4%');
    fixture.componentRef.setInput('caption', 'vs last month');
    fixture.detectChanges();
    expect(text('.uni-stat-delta')).toContain('up');
    expect(text('.uni-stat-delta')).toContain('12.4%');
    expect(text('.uni-stat-caption')).toBe('vs last month');
  });

  it('renders a decorative sparkline only with enough points', () => {
    expect(host().querySelector('svg')).toBeNull();
    fixture.componentRef.setInput('trend', [31, 34, 33, 38, 41, 48]);
    fixture.detectChanges();
    const svg = host().querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelector('path')!.getAttribute('d')).toMatch(/^M0\.0,/);
    expect(svg.querySelector('circle')).not.toBeNull();
  });
});
