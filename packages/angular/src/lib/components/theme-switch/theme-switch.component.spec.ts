import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniThemes } from '@uni-design-system/uni-core';
import { ThemeService } from '../../theming';
import { UniThemeSwitchComponent } from './theme-switch.component';

describe('UniThemeSwitchComponent', () => {
  let fixture: ComponentFixture<UniThemeSwitchComponent>;
  let theme: ThemeService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [UniThemeSwitchComponent] }).compileComponents();
    theme = TestBed.inject(ThemeService);
    fixture = TestBed.createComponent(UniThemeSwitchComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('lists every registered theme as an option', () => {
    const options = [...fixture.nativeElement.querySelectorAll('option')].map((o) =>
      o.textContent?.trim()
    );
    for (const key of Object.keys(UniThemes)) {
      expect(options).toContain(UniThemes[key].name);
    }
  });

  it('reflects the active theme selection', () => {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    const index = Object.keys(UniThemes).indexOf(theme.selectedThemeKey());
    expect(select.value).toBe(index.toString());
  });

  it('applies and emits the chosen theme', () => {
    let emitted: string | undefined;
    fixture.componentInstance.themeChanged.subscribe((key: string) => (emitted = key));

    const keys = Object.keys(UniThemes);
    const nextKey = keys.find((key) => key !== theme.selectedThemeKey())!;
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = keys.indexOf(nextKey).toString();
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(theme.selectedThemeKey()).toBe(nextKey);
    expect(theme.theme().id).toBe(UniThemes[nextKey].id);
    expect(emitted).toBe(nextKey);
  });

  it('lists a runtime-registered brand theme and shows it selected', () => {
    theme.applyPalette({ seed: '#2C3E35', scheme: 'triadic', category: 'earth' });
    fixture.detectChanges();

    const options = [...fixture.nativeElement.querySelectorAll('option')].map((o) =>
      o.textContent?.trim()
    );
    expect(options).toContain('Your Brand');

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    const keys = theme.themeOptions().map((option) => option.value);
    expect(select.value).toBe(keys.indexOf(ThemeService.CUSTOM_KEY).toString());
  });

  it('round-trips between a built-in theme and the brand theme', () => {
    theme.applyPalette({ seed: '#2C3E35', scheme: 'triadic', category: 'earth' });
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    const keys = theme.themeOptions().map((option) => option.value);

    select.value = keys.indexOf('DarkTheme').toString();
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(theme.isCustomTheme()).toBe(false);

    select.value = keys.indexOf(ThemeService.CUSTOM_KEY).toString();
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(theme.isCustomTheme()).toBe(true);
    expect(theme.selectedThemeKey()).toBe(ThemeService.CUSTOM_KEY);
  });
});
