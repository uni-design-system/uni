/**
 * The point of this control is that it does *not* impose a box on the sentence
 * it sits in, so the specs are mostly about what it refuses to add: no
 * padding, no border, no background, and type inherited rather than set.
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { emittedRuleFor } from '../../../testing/emitted-css';
import { UniInlineButtonComponent } from './inline-button.component';

/** The selector is an attribute on `button`, so the control needs a real host. */
@Component({
  imports: [UniInlineButtonComponent],
  template: `
    <p>
      Text before
      <button
        inline-button
        [iconName]="iconName()"
        [symbolName]="symbolName()"
        [iconPosition]="iconPosition()"
        [underline]="underline()"
        [link]="link()"
        [disable]="disable()"
      >
        Read the policy
      </button>
      text after.
    </p>
  `,
})
class InlineButtonHost {
  // Signals, not plain fields: the library runs zoneless, so a mutated field
  // marks nothing dirty and the child's computeds never re-run.
  readonly iconName = signal<string | undefined>(undefined);
  readonly symbolName = signal<string | undefined>(undefined);
  readonly iconPosition = signal<'start' | 'end'>('start');
  readonly underline = signal<boolean | undefined>(undefined);
  readonly link = signal(false);
  readonly disable = signal(false);
}

describe('UniInlineButtonComponent', () => {
  let fixture: ComponentFixture<InlineButtonHost>;

  const host = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('button')!;
  const label = (): HTMLElement => host().querySelector('span')!;

  const render = (inputs: Record<string, unknown> = {}) => {
    const instance = fixture.componentInstance as unknown as Record<string, { set(v: unknown): void }>;
    for (const [name, value] of Object.entries(inputs)) instance[name].set(value);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InlineButtonHost] }).compileComponents();
    fixture = TestBed.createComponent(InlineButtonHost);
    fixture.detectChanges();
  });

  it('is a real button, so Enter and Space work without extra handlers', () => {
    expect(host().tagName).toBe('BUTTON');
    expect(host().getAttribute('type')).toBe('button');
  });

  it('inherits the surrounding type instead of setting its own', () => {
    const css = emittedRuleFor(host());

    // `font` is a shorthand: family, size, weight and line-height in one.
    expect(css).toContain('font:inherit');
    expect(css).toContain('color:inherit');
    expect(css).toContain('letter-spacing:inherit');
  });

  it('adds no box: a ghost button would push the words apart', () => {
    const css = emittedRuleFor(host());

    expect(css).toContain('padding:0');
    expect(css).toContain('border:0');
    expect(css).toContain('background:none');
    // The engine will blockify this to `inline-block` regardless; it is
    // declared so a reset that makes buttons `display: block` cannot drop the
    // control onto a line of its own.
    expect(css).toContain('display:inline');
    expect(css).not.toContain('display:inline-flex');
  });

  it('underlines only when asked, keeping the hover affordance', () => {
    // The base rule, up to the first nested selector — the `:hover` block
    // always underlines, which is the affordance, not the default state.
    const base = (el: Element) => emittedRuleFor(el).split(':hover')[0];

    expect(base(label())).toContain('text-decoration-line:none');

    render({ underline: true });
    expect(base(label())).toContain('text-decoration-line:underline');
  });

  it('renders a theme icon beside the label, sized in em so it scales with the text', () => {
    render({ iconName: 'externalLink' });
    const icon = host().querySelector('uni-icon') as HTMLElement;

    expect(icon).not.toBeNull();
    expect(icon.style.width).toBe('1em');
    expect(icon.style.height).toBe('1em');
  });

  it('puts the glyph on the side asked for', () => {
    render({ iconName: 'externalLink', iconPosition: 'end' });
    const children = Array.from(host().children).map((c) => c.tagName);

    expect(children.indexOf('UNI-ICON')).toBeGreaterThan(children.indexOf('SPAN'));
  });

  it('falls back to a symbol ligature for glyphs the icon set lacks', () => {
    render({ symbolName: 'rocket_launch' });

    expect(host().querySelector('uni-symbol')).not.toBeNull();
    expect(host().querySelector('uni-icon')).toBeNull();
  });

  it('disables natively rather than with a class', () => {
    render({ disable: true });
    expect(host().hasAttribute('disabled')).toBe(true);
  });
});

/**
 * The natural way to write this in a template is a bare attribute. The DOM
 * hands those over as the empty string, which without a transform is falsy —
 * so `<button inline-button underline>` used to render with no underline at
 * all, and `link` with no link colour.
 */
@Component({
  imports: [UniInlineButtonComponent],
  template: `<p>Read the <button inline-button underline link>policy</button> first.</p>`,
})
class BareAttributeHost {}

it('reads bare `underline` and `link` attributes as true', async () => {
  await TestBed.configureTestingModule({ imports: [BareAttributeHost] }).compileComponents();
  const fixture = TestBed.createComponent(BareAttributeHost);
  fixture.detectChanges();

  const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
  const label = button.querySelector('span')!;

  expect(emittedRuleFor(label).split(':hover')[0]).toContain('text-decoration-line:underline');
  // `link` paints the label rather than letting it inherit the run of text.
  expect(emittedRuleFor(button)).toMatch(/color:(?!inherit)/);
});
