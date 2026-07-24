import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniTextComponent } from './text.component';

@Component({
  imports: [UniTextComponent],
  template: `
    <h1 uni-text id="h1">Title</h1>
    <p uni-text id="p">Body</p>
    <span uni-text id="span">Plain</span>
    <span uni-text="caption" id="short">Shorthand</span>
    <h2 uni-text="display-small" id="override">Promoted</h2>
    <span uni-text typeface="quote" id="input">Via input</span>
  `,
})
class Host {}

describe('UniTextComponent', () => {
  let fixture: ComponentFixture<Host>;

  const fontSize = (id: string): string =>
    getComputedStyle((fixture.nativeElement as HTMLElement).querySelector(`#${id}`)!).fontSize;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('infers the typeface from the host element', () => {
    expect(fontSize('h1')).toBe('32px'); // headline-large
    expect(fontSize('p')).toBe('16px'); // body-1-long
    expect(fontSize('span')).toBe('14px'); // title-small fallback
  });

  it('takes the typeface from the attribute value', () => {
    expect(fontSize('short')).toBe('12px'); // caption
  });

  it('lets the attribute value beat the element default', () => {
    expect(fontSize('override')).toBe('36px'); // display-small, not headline-medium
  });

  it('keeps the explicit typeface input working', () => {
    expect(fontSize('input')).toBe('16px'); // quote
  });
});
