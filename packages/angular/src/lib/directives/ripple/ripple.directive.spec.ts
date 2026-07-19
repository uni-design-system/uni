import { ElementRef, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RippleDirective } from './ripple.directive';

describe('RippleDirective', () => {
  it('instantiates within an injection context', () => {
    TestBed.configureTestingModule({
      providers: [
        RippleDirective,
        { provide: ElementRef, useValue: new ElementRef(document.createElement('button')) },
        {
          provide: Renderer2,
          useValue: {
            createElement: (tag: string) => document.createElement(tag),
            addClass: () => undefined,
            removeClass: () => undefined,
            appendChild: () => undefined,
            setStyle: () => undefined,
          },
        },
      ],
    });

    const directive = TestBed.inject(RippleDirective);
    expect(directive).toBeTruthy();
  });
});
