import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniStackDirective } from './stack.directive';

@Component({
  imports: [UniStackDirective],
  template: `<div stack-layout id="stack">items</div>`,
})
class Host {}

describe('UniStackDirective', () => {
  let fixture: ComponentFixture<Host>;

  const style = (): CSSStyleDeclaration =>
    getComputedStyle((fixture.nativeElement as HTMLElement).querySelector('#stack')!);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('lays out as a vertical flex column by default', () => {
    expect(style().display).toBe('flex');
    expect(style().flexDirection).toBe('column');
  });
});
