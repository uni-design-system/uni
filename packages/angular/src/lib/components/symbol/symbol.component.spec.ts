import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniSymbolComponent } from './symbol.component';

describe('UniSymbolComponent', () => {
  let fixture: ComponentFixture<UniSymbolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniSymbolComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniSymbolComponent);
    fixture.componentRef.setInput('name', 'close');
    fixture.detectChanges();
  });

  it('creates and renders the ligature name', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('close');
  });

  it('is decorative by default (aria-hidden)', () => {
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-hidden')).toBe('true');
  });
});
