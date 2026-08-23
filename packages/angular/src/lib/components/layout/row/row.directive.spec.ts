import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniRowDirective } from './row.directive';

@Component({
  imports: [UniRowDirective],
  template: `<div row-layout gap="sm" id="row">items</div>`,
})
class Host {}

describe('UniRowDirective', () => {
  let fixture: ComponentFixture<Host>;

  const style = (): CSSStyleDeclaration =>
    getComputedStyle((fixture.nativeElement as HTMLElement).querySelector('#row')!);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('lays out as a horizontal flex row by default', () => {
    expect(style().display).toBe('flex');
    expect(style().flexDirection).toBe('row');
  });

  it('resolves gap from the spacing scale', () => {
    expect(style().gap).toBe('8px');
  });
});
