import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniCenterDirective } from './center.directive';

@Component({
  imports: [UniCenterDirective],
  template: `<div center-layout id="center">centered</div>`,
})
class Host {}

describe('UniCenterDirective', () => {
  let fixture: ComponentFixture<Host>;

  const style = (): CSSStyleDeclaration =>
    getComputedStyle((fixture.nativeElement as HTMLElement).querySelector('#center')!);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('centers its content on both axes', () => {
    expect(style().display).toBe('flex');
    expect(style().justifyContent).toBe('center');
    expect(style().alignItems).toBe('center');
  });
});
