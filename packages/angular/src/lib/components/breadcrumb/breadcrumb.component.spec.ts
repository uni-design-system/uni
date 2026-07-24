import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniBreadcrumbComponent } from './breadcrumb.component';
import type { BreadcrumbItem } from './breadcrumb.model';

describe('UniBreadcrumbComponent', () => {
  let fixture: ComponentFixture<UniBreadcrumbComponent>;

  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Reports' },
    { label: 'Q3 Revenue' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniBreadcrumbComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniBreadcrumbComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
  });

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;

  it('renders a labelled nav landmark with an ordered list', () => {
    const nav = host().querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(nav.querySelectorAll('ol > li').length).toBe(3);
  });

  it('marks the last item as the current page, not a link', () => {
    const current = host().querySelector('[aria-current="page"]')!;
    expect(current.textContent).toBe('Q3 Revenue');
    expect(current.tagName).toBe('SPAN');
  });

  it('renders href items as anchors and href-less items as buttons', () => {
    expect(host().querySelector('a')!.getAttribute('href')).toBe('/');
    expect(host().querySelector('button')!.textContent).toBe('Reports');
  });

  it('emits itemClicked for ancestor navigation', () => {
    let clicked: BreadcrumbItem | undefined;
    fixture.componentInstance.itemClicked.subscribe((item) => (clicked = item));
    host().querySelector('button')!.click();
    expect(clicked).toEqual({ label: 'Reports' });
  });

  it('hides separators from assistive tech and renders one fewer than items', () => {
    const separators = host().querySelectorAll('symbol[aria-hidden="true"], Symbol[aria-hidden="true"], [aria-hidden="true"]');
    expect(separators.length).toBe(2);
  });
});
