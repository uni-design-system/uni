/**
 * The card's frame and its states. The frame used to be an inline `[style]`,
 * which outranks every class — so no theme rule could express a state and a
 * consumer who needed a selectable card had to build one beside this one.
 */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createTheme, LightTheme } from '@uni-design-system/uni-core';
import { UniCardComponent } from './card.component';
import { ThemeService } from '../../theming';
import { emittedRuleFor } from '../../../testing/emitted-css';

describe('UniCardComponent', () => {
  let fixture: ComponentFixture<UniCardComponent>;

  const frame = () => (fixture.nativeElement as HTMLElement).firstElementChild as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniCardComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('frames itself with an Emotion class, not an inline style', () => {
    expect(frame().getAttribute('style')).toBeNull();
    const rule = emittedRuleFor(frame());
    expect(rule).toContain('border-radius');
    expect(rule).toMatch(/border:/);
  });

  it('is a plain container by default: no role, no tab stop, no state classes', () => {
    expect(frame().getAttribute('role')).toBeNull();
    expect(frame().getAttribute('tabindex')).toBeNull();
    expect(frame().classList.contains('card-selected')).toBe(false);
    expect(frame().classList.contains('card-interactive')).toBe(false);
    expect(emittedRuleFor(frame())).not.toContain('cursor:pointer');
  });

  it('selected adds the class and the selectedBorder frame', () => {
    const theme = TestBed.inject(ThemeService);
    theme.registerTheme(
      createTheme({
        id: 'WarnPick',
        name: 'Warn Pick',
        colors: LightTheme.colors,
        components: { card: { options: { selectedBorder: 'warn' } } },
      }),
      { select: true }
    );
    fixture.detectChanges();
    const before = emittedRuleFor(frame());

    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
    expect(frame().classList.contains('card-selected')).toBe(true);
    const after = emittedRuleFor(frame());
    // The CSSOM reports colours as rgb(), so compare the warn frame that way.
    const warnHex = theme.colors()['warn'] ?? '';
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(warnHex.slice(i, i + 2), 16));
    const warnBorder = `rgb(${r},${g},${b})`;
    expect(after).toContain(warnBorder);
    expect(before).not.toContain(warnBorder);
  });

  it('interactive adds the class, the pointer and activated on click', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    let activations = 0;
    fixture.componentInstance.activated.subscribe(() => activations++);

    expect(frame().classList.contains('card-interactive')).toBe(true);
    expect(emittedRuleFor(frame())).toContain('cursor:pointer');
    frame().click();
    expect(activations).toBe(1);
  });

  it('a card that is not interactive never activates', () => {
    let activations = 0;
    fixture.componentInstance.activated.subscribe(() => activations++);
    frame().click();
    expect(activations).toBe(0);
  });

  it('a theme reaches the states through the variant rule, as uni-tag', () => {
    TestBed.inject(ThemeService).registerTheme(
      createTheme({
        id: 'Picked',
        name: 'Picked',
        colors: LightTheme.colors,
        components: {
          card: { variants: { primary: { '&.card-selected': { outlineOffset: '7px' } } } },
        },
      }),
      { select: true }
    );
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
    expect(emittedRuleFor(frame())).toContain('.card-selected{outline-offset:7px');
  });

  it('reads hoverColor and selectedColor from the options', () => {
    TestBed.inject(ThemeService).registerTheme(
      createTheme({
        id: 'Washed',
        name: 'Washed',
        colors: LightTheme.colors,
        components: {
          card: { options: { hoverColor: 'primary-container', selectedColor: 'surface' } },
        },
      }),
      { select: true }
    );
    fixture.componentRef.setInput('interactive', true);
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
    const rule = emittedRuleFor(frame());
    expect(rule).toMatch(/:hover\{[^}]*background-color/);
    // The selected surface, outside the hover block: fill and its on-color.
    const resting = rule.replace(/:hover\{[^}]*\}/, '');
    expect(resting).toMatch(/background-color:/);
    expect(resting).toMatch(/[{;]color:/);
  });
});

@Component({
  imports: [UniCardComponent],
  template: `
    <uni-card [interactive]="true" (activated)="activations = activations + 1">
      <span id="text">Sofa</span>
      <button id="inner" type="button" (click)="inner = inner + 1">More</button>
    </uni-card>
  `,
})
class ContentHost {
  activations = 0;
  inner = 0;
}

describe('UniCardComponent with controls in its content', () => {
  it("a click on the card's own control is the control's, not the card's", async () => {
    await TestBed.configureTestingModule({ imports: [ContentHost] }).compileComponents();
    const fixture = TestBed.createComponent(ContentHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    host.querySelector<HTMLElement>('#inner')!.click();
    expect(fixture.componentInstance.inner).toBe(1);
    expect(fixture.componentInstance.activations).toBe(0);

    host.querySelector<HTMLElement>('#text')!.click();
    expect(fixture.componentInstance.activations).toBe(1);
  });
});

