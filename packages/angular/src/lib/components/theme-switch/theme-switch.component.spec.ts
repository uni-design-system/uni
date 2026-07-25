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
});
