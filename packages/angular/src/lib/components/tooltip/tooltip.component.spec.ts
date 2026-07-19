import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniTooltipComponent } from './tooltip.component';

describe('UniTooltipComponent', () => {
  let fixture: ComponentFixture<UniTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniTooltipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UniTooltipComponent);
    fixture.componentRef.setInput('label', 'More info');
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the bubble declaratively as a popover with tooltip semantics', () => {
    const tip = (fixture.nativeElement as HTMLElement).querySelector('[role="tooltip"]')!;
    expect(tip).not.toBeNull();
    expect(tip.getAttribute('popover')).toBe('manual');
    expect(tip.id).toBe(fixture.componentInstance.tooltipId);
    expect(tip.textContent).toContain('More info');
  });

  it('describes the host via aria-describedby once rendered', async () => {
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-describedby')).toBe(fixture.componentInstance.tooltipId);
    // No focusable content projected: host joins the tab order
    expect(host.getAttribute('tabindex')).toBe('0');
  });
});
