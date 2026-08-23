import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniBoxDirective } from './box.directive';

@Component({
  imports: [UniBoxDirective],
  template: `
    <div box-layout padding="md" id="tokens">boxed</div>
    <div uni-box-layout id="alias">boxed</div>
  `,
})
class Host {}

describe('UniBoxDirective', () => {
  let fixture: ComponentFixture<Host>;

  const el = (id: string): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector(`#${id}`)!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('applies spacing tokens as real CSS', () => {
    expect(getComputedStyle(el('tokens')).padding).toBe('16px');
  });

  it('matches both the canonical and short attribute selectors', () => {
    expect(el('alias').className).toMatch(/css-/);
  });
});
