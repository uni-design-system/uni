import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniWrapDirective } from './wrap.directive';

@Component({
  imports: [UniWrapDirective],
  template: `<div wrap-layout id="wrap">items</div>`,
})
class Host {}

describe('UniWrapDirective', () => {
  let fixture: ComponentFixture<Host>;

  const style = (): CSSStyleDeclaration =>
    getComputedStyle((fixture.nativeElement as HTMLElement).querySelector('#wrap')!);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('wraps its flex items by default', () => {
    expect(style().display).toBe('flex');
    expect(style().flexWrap).toBe('wrap');
  });
});
