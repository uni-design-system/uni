/**
 * How the area is sized. jsdom has no layout, so what is asserted is the CSS
 * contract: a `height`-sized or content-sized area keeps the block layout it
 * always had, and `maxHeight` / `fill` switch host and viewport to the nested
 * flex column that lets the viewport shrink below its content and scroll.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UniScrollAreaComponent } from './scroll-area.component';
import { emittedRuleFor } from '../../../testing/emitted-css';

describe('UniScrollAreaComponent sizing', () => {
  const render = async (template: string) => {
    const Host = Component({
      selector: 'uni-test-host',
      imports: [UniScrollAreaComponent],
      template,
    })(class TestHost {});
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[scroll-area]')!;
    const viewport = host.firstElementChild as HTMLElement;
    return { host: emittedRuleFor(host), viewport: emittedRuleFor(viewport) };
  };

  // `emittedRuleFor` strips whitespace, so `flex: 1 1 auto` reads `flex:11auto`.
  it('is a block with a full-height viewport when sized by height or content', async () => {
    const { host, viewport } = await render(`<div scroll-area [height]="200"><p>a</p></div>`);
    expect(host).toContain('display:block');
    expect(host).toContain('height:200px');
    expect(host).not.toContain('max-height');
    expect(viewport).toContain('height:100%');
    expect(viewport).not.toContain('flex:1');
  });

  it('maxHeight caps a content-sized area and lets the viewport shrink to scroll', async () => {
    const { host, viewport } = await render(`<div scroll-area [maxHeight]="160"><p>a</p></div>`);
    expect(host).toContain('display:flex');
    expect(host).toContain('flex-direction:column');
    expect(host).toContain('max-height:160px');
    expect(viewport).toContain('flex:11auto');
    expect(viewport).toContain('min-height:0');
    expect(viewport).toContain('overflow:auto');
  });

  it('fill takes the room a flex-column parent leaves', async () => {
    const { host, viewport } = await render(`<div scroll-area fill><p>a</p></div>`);
    expect(host).toContain('flex:11auto');
    expect(host).toContain('min-height:0');
    expect(host).toContain('display:flex');
    expect(viewport).toContain('flex:11auto');
  });
});
