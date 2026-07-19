import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniProgressBarComponent } from './progress-bar.component';

describe('UniProgressBarComponent', () => {
  let fixture: ComponentFixture<UniProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniProgressBarComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniProgressBarComponent);
    fixture.componentRef.setInput('percent', 40);
    fixture.detectChanges();
  });

  it('announces as a progressbar with current value', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('progressbar');
    expect(host.getAttribute('aria-valuemin')).toBe('0');
    expect(host.getAttribute('aria-valuemax')).toBe('100');
    expect(host.getAttribute('aria-valuenow')).toBe('40');
    expect(host.getAttribute('aria-label')).toBe('Progress');
  });

  it('uses a custom ariaLabel when provided', () => {
    fixture.componentRef.setInput('ariaLabel', 'Upload progress');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-label')).toBe(
      'Upload progress'
    );
  });
});
