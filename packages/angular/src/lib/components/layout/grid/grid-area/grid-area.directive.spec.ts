import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniGridAreaDirective } from './grid-area.directive';

@Component({
  imports: [UniGridAreaDirective],
  template: `<div grid-area-layout area="main" id="area">cell</div>`,
})
class Host {}

describe('UniGridAreaDirective', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('places the element into the named grid area', () => {
    const el = (fixture.nativeElement as HTMLElement).querySelector('#area')!;
    expect(getComputedStyle(el).gridArea).toBe('main');
  });
});
