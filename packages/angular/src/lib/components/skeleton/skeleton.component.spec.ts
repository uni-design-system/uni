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
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-hidden')).toBe('true');
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

  it('circles default their width to the height', () => {
    fixture.componentRef.setInput('shape', 'circle');
    fixture.componentRef.setInput('height', 56);
    fixture.detectChanges();
    expect(blocks()[0].style.width).toBe('56px');
  });
});
