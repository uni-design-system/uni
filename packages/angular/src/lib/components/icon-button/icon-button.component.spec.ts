import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniIconButtonComponent } from './icon-button.component';

describe('UniIconButtonComponent', () => {
  let fixture: ComponentFixture<UniIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniIconButtonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniIconButtonComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes ariaLabel as the accessible name', () => {
    fixture.componentRef.setInput('ariaLabel', 'Close');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-label')).toBe('Close');
  });

  it('renders a visually-hidden slot so projected text names the button', () => {
    const srSpan = (fixture.nativeElement as HTMLElement).querySelector('span');
    expect(srSpan).not.toBeNull();
  });

  it('marks the button busy while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(host.hasAttribute('disabled')).toBe(true);
  });
});
