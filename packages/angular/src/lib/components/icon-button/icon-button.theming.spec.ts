/**
 * The hover treatment belongs to the theme.
 *
 * It used to be two branches on `variant() === 'ghost'` inside the component,
 * applied *after* the theme's own styles. That partition was binary, so under
 * an open registry every consumer-registered intent landed in the not-ghost
 * half and got a raised shadow — and no theme could say otherwise.
 */
import { TestBed } from '@angular/core/testing';
import { createTheme, LightTheme } from '@uni-design-system/uni-core';
import { UniIconButtonComponent } from './icon-button.component';
import { ThemeService } from '../../theming';
import { emittedRuleFor } from '../../../testing/emitted-css';

const render = (variant?: string): string => {
  const fixture = TestBed.createComponent(UniIconButtonComponent);
  if (variant) fixture.componentRef.setInput('variant', variant);
  fixture.detectChanges();
  return emittedRuleFor(fixture.nativeElement as HTMLElement).toLowerCase();
};

/**
 * Every `:hover` block, so a shadow elsewhere in the rule cannot fool us.
 *
 * All of them, not the first: the bug being guarded emits a *second* hover rule
 * after the theme's, and matching only the first would read the theme's
 * intention rather than what the browser ends up applying.
 */
const hoverBlock = (rules: string): string =>
  (rules.match(/:hover\{[^}]*\}/g) ?? []).join('');

beforeEach(async () => {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({ imports: [UniIconButtonComponent] }).compileComponents();
});

describe('icon button hover, from the theme', () => {
  it('lifts the filled variants', () => {
    for (const variant of ['primary', 'secondary', 'tertiary', 'warn', 'success']) {
      expect(hoverBlock(render(variant)), variant).toContain('box-shadow');
    }
  });

  it('washes the hollow one instead of lifting it', () => {
    const hover = hoverBlock(render('ghost'));
    expect(hover).toContain('rgba(0,0,0,0.1)');
    expect(hover).not.toContain('box-shadow');
  });

  it('lets a theme restyle the ghost hover', () => {
    // Both themes in this repo declare one and had it overridden: the
    // component's branch ran after the theme and won.
    TestBed.inject(ThemeService).registerTheme(
      createTheme({
        id: 'HoverTheme',
        name: 'Hover Theme',
        colors: LightTheme.colors,
        components: {
          iconButton: {
            variants: { ghost: { '&:hover': { backgroundColor: 'rgb(1,2,3)' } } },
          },
        },
      }),
      { select: true }
    );
    const hover = hoverBlock(render('ghost'));
    expect(hover).toContain('rgb(1,2,3)');
    expect(hover).not.toContain('rgba(0,0,0,0.1)');
  });

  it('does not force a hover onto a variant the theme never styled', () => {
    // The old `!== 'ghost'` branch swept these in, so a recessive intent a
    // consumer registered was given a raised shadow it never asked for.
    expect(hoverBlock(render('light'))).not.toContain('box-shadow');
  });

  it('leaves the disabled variant without a hover affordance', () => {
    // Its block is also spread into `&:disabled`, so a hover here would lift a
    // control that cannot be pressed.
    expect(hoverBlock(render('disabled'))).not.toContain('box-shadow');
  });
});
