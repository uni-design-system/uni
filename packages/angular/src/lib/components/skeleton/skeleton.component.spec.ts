import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniSkeletonComponent } from './skeleton.component';

describe('UniSkeletonComponent', () => {
  let fixture: ComponentFixture<UniSkeletonComponent>;

  const blocks = (): HTMLElement[] =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.uni-skeleton-block'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniSkeletonComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniSkeletonComponent);
  });

  it('is hidden from assistive tech', () => {
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
  });

  it('announces itself as a status when labelled', () => {
    fixture.componentRef.setInput('label', 'Loading results');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBeNull();
    expect(host.getAttribute('role')).toBe('status');
    expect(host.textContent).toContain('Loading results');
  });

  it('renders one block per text line, ending on a short line', () => {
    fixture.componentRef.setInput('lines', 3);
    fixture.detectChanges();
    const rendered = blocks();
    expect(rendered.length).toBe(3);
    expect(rendered[0].style.width).toBe('100%');
    expect(rendered[2].style.width).toBe('60%');
  });

  it('honors explicit width and numeric px sizing', () => {
    fixture.componentRef.setInput('shape', 'rect');
    fixture.componentRef.setInput('width', 240);
    fixture.detectChanges();
    expect(blocks()[0].style.width).toBe('240px');
  });

  it('restyles when a token override differs from the theme option', () => {
    fixture.detectChanges();
    const themed = (fixture.nativeElement as HTMLElement).className;
    fixture.componentRef.setInput('color', 'primary');
    fixture.componentRef.setInput('borderRadius', 'max');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).className).not.toBe(themed);
  });

  it('circles default their width to the height', () => {
    fixture.componentRef.setInput('shape', 'circle');
    fixture.componentRef.setInput('height', 56);
    fixture.detectChanges();
    expect(blocks()[0].style.width).toBe('56px');
  });
});
