import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniGridDirective } from './grid.directive';

@Component({
  imports: [UniGridDirective],
  template: `<div grid-layout templateColumns="1fr 1fr" padding="md" id="grid">cells</div>`,
})
class Host {}

describe('UniGridDirective', () => {
  let fixture: ComponentFixture<Host>;

  const style = (): CSSStyleDeclaration =>
    getComputedStyle((fixture.nativeElement as HTMLElement).querySelector('#grid')!);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('lays out as a grid with its own template', () => {
    expect(style().display).toBe('grid');
    expect(style().gridTemplateColumns).toBe('1fr 1fr');
  });

  // Grid binds its own host [class] on top of the one it inherits from Box;
  // Angular merges the two class maps rather than letting one win.
  it('keeps the inherited Box tokens alongside its own', () => {
    expect(style().padding).toBe('16px');
  });
});
