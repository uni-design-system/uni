import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseTheme, createTheme } from '@uni-design-system/uni-core';
import { UniBoxDirective } from '../components/layout/box/box.directive';
import { ThemeService } from './theme.service';
import { UNI_THEMES } from './theme.token';

const CustomSpacing = createTheme({
  id: 'CustomSpacing',
  name: 'Custom spacing',
  colors: BaseTheme.colors,
  // The point of the open scale: name the steps the design actually uses.
  spacing: { tight: '6px', snug: '10px', cozy: '12px' },
});

@Component({
  imports: [UniBoxDirective],
  template: `
    <div box-layout padding="tight" gap="snug" id="custom">custom steps</div>
    <div box-layout padding="md" id="named">named step</div>
    <div box-layout padding="xxl" id="xxl">xxl</div>
    <div box-layout padding="noSuchToken" id="unknown">unknown</div>
  `,
})
class Host {}

describe('the spacing scale, applied', () => {
  let fixture: ComponentFixture<Host>;
  let warn: ReturnType<typeof vi.spyOn>;

  const style = (id: string): CSSStyleDeclaration =>
    getComputedStyle((fixture.nativeElement as HTMLElement).querySelector(`#${id}`)!);

  beforeEach(async () => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [{ provide: UNI_THEMES, useValue: { CustomSpacing } }],
    }).compileComponents();
    TestBed.inject(ThemeService).selectTheme('CustomSpacing');
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => warn.mockRestore());

  it('resolves spacing tokens the theme invented', () => {
    expect(style('custom').padding).toBe('6px');
    expect(style('custom').gap).toBe('10px');
  });

  it('keeps the named steps working alongside them', () => {
    expect(style('named').padding).toBe('16px');
    expect(style('xxl').padding).toBe('128px');
  });

  // The scale is open, so a typo cannot be a compile error — it would
  // otherwise vanish silently, since an undefined CSS value is just dropped.
  it('warns once for a token the theme does not define', () => {
    const messages = warn.mock.calls.map((c) => String(c[0]));
    const hits = messages.filter((m) => m.includes('noSuchToken'));
    expect(hits).toHaveLength(1);
    expect(hits[0]).toContain('Unknown spacing token');
  });
});
