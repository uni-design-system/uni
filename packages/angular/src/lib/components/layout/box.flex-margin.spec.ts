import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniBoxDirective } from './box/box.directive';

@Component({
  imports: [UniBoxDirective],
  template: `
    <div box-layout [grow]="1" id="grow">grow</div>
    <div box-layout [flex]="1" id="flex">flex</div>
    <div box-layout flex="1 1 auto" id="flex-string">flex string</div>
    <div box-layout [shrink]="0" [basis]="200" id="shrink-basis">shrink/basis</div>
    <div box-layout maxWidth="800px" marginInline="auto" id="centered">page shell</div>
    <div box-layout marginInline="md" id="token-margin">token margin</div>
  `,
})
class Host {}

describe('UniBoxDirective flex and inline margin', () => {
  let fixture: ComponentFixture<Host>;

  const style = (id: string): CSSStyleDeclaration =>
    getComputedStyle((fixture.nativeElement as HTMLElement).querySelector(`#${id}`)!);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  // `grow` emits flex-grow only, leaving flex-basis auto — which is exactly
  // why it cannot stand in for `flex: 1`.
  it('keeps grow as flex-grow alone', () => {
    expect(style('grow').flexGrow).toBe('1');
    expect(style('grow').flexBasis).not.toBe('0%');
  });

  // `flex: 1` normalizes to `1 1 0%` — the zero basis `grow` cannot produce.
  it('emits the flex shorthand', () => {
    expect(style('flex').flex).toBe('1 1 0%');
    expect(style('flex-string').flex).toBe('1 1 auto');
  });

  it('emits shrink and basis', () => {
    expect(style('shrink-basis').flexShrink).toBe('0');
    expect(style('shrink-basis').flexBasis).toBe('200px');
  });

  it('centers a max-width container with marginInline="auto"', () => {
    expect(style('centered').marginInline).toBe('auto');
    expect(style('centered').maxWidth).toBe('800px');
  });

  it('resolves a spacing token for marginInline', () => {
    expect(style('token-margin').marginInline).toBe('16px');
  });
});
