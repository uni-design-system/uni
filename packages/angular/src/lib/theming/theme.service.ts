// noinspection JSUnusedGlobalSymbols

import { computed, inject, Injectable, linkedSignal, Signal, signal } from '@angular/core';
import { css } from '@emotion/css';
import { LocalStorageService, Options } from '../cdk';
import {
  LightTheme,
  type NullableSize,
  type ThemeName,
  type Typeface,
  type UniTheme,
  Z_INDEX,
  type ZIndexableElements,
  ColorToken,
  ComponentName,
  ComponentTheme,
  ContainerColorToken,
  ContentColorToken,
  NullableStyleExpression,
  OptionalSize,
  Size,
  TextRole,
  Thickness,
  Variant,
  type ColorKey,
  type Radius,
  type Border,
  type Shadow,
} from '@uni-design-system/uni-core';

import { UNI_THEMES } from './theme.token';
import { safeParseInt } from '../cdk/helpers/number.helper';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themes = inject(UNI_THEMES);
  private localStorage = inject(LocalStorageService);

  theme = signal<UniTheme>(LightTheme);
  themeOptions = signal<Options<ThemeName>>([]);

  components = computed(() => this.theme().components);
  component = <T>(componentName: ComponentName): Signal<ComponentTheme<T>> =>
    computed(() => (this.components()[componentName] as ComponentTheme<T>) || {});
  colors = computed(() => this.theme().colors);
  typeFaces = computed(() => this.theme().typefaces);
  spacing = computed(() => this.theme().spacing);
  thicknesses = computed(() => this.theme().thicknesses);
  radii = computed(() => this.theme().radii);
  borders = computed(() => this.theme().borders);
  shadows = computed(() => this.theme().shadows);
  icons = computed(() => this.theme().icons);

  constructor() {
    this.themeOptions.set(
      Object.keys(this.themes).map((key) => {
        return { label: this.themes[key].name, value: key };
      })
    );

    this.selectTheme(this.localStorage.getItem('theme') || Object.keys(this.themes)[0] || 'base');
  }

  public selectTheme(themeName: ThemeName): void {
    this.selectedThemeKey.set(themeName);
    if (this.themes[themeName]) this.theme.set(this.themes[themeName]);
    this.localStorage.setItem('theme', themeName);
  }

  public selectedThemeName = computed(() => this.theme().name);
  public selectedThemeKey = signal<string>('');

  textClass = (textRole: TextRole, textColor?: ContentColorToken) => {
    return css([
      {
        ...this.typeFaces()[textRole],
      },
      textColor && {
        color: this.colors()[textColor],
      },
    ]);
  };

  componentStyle = (componentName: ComponentName, variant: Variant, size: Size) =>
    computed(() => {
      const component = this.component(componentName)();
      const { fixed, colors, sizes } = component;
      const colorStyle = colors && colors[variant];
      const sizeStyle = sizes && sizes[size];
      return { ...fixed, ...colorStyle, ...sizeStyle };
    });

  getSpacing = (size: NullableSize) => {
    return size === 'none' ? 'none' : this.spacing()[size];
  };

  getThickness = (thickness: Thickness) => this.theme().thicknesses[thickness];

  getContentColor = (token: ContainerColorToken, useVariant?: boolean) =>
    useVariant
      ? this.colors()[`on-${token}-variant` as ColorToken]
      : this.colors()[`on-${token}` as ColorToken];

  colorPair = (token?: ContainerColorToken, colorVariant?: boolean): NullableStyleExpression => {
    if (!token) return;
    const backgroundColor = this.colors()[token];
    const color = this.getContentColor(token, colorVariant);
    return { color, backgroundColor };
  };

  backgroundColor = (token?: ColorKey): NullableStyleExpression => {
    return !token ? undefined : { backgroundColor: this.colors()[token] };
  };

  backgroundImage = (url?: string): NullableStyleExpression => {
    return !url ? undefined : { backgroundImage: `url(${url})` };
  };

  getContainerColors = (color: Variant, useVariant?: boolean) => {
    const token = (color + '-container') as ContainerColorToken;
    return this.colorPair(token, useVariant);
  };

  typeface = (typeface?: Typeface) => {
    const typefaces = this.typeFaces();
    console.log('typefaces:', typefaces);
    return typeface && typefaces[typeface];
  };

  colorPalette = () => this.colors();

  color(color?: ColorKey): NullableStyleExpression {
    return !color ? undefined : { color: this.colors()[color] };
  }

  getDashedBorder(
    color: ColorKey | undefined,
    radius: Radius | undefined
  ): NullableStyleExpression {
    if (!color) return;

    const r = radius && this.radii()[radius];
    const borderRadius = r ? safeParseInt(r) : 0;
    const colors = this.colors()[color];
    const strokeColor = colors?.replace('#', '%23');

    return {
      backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='${borderRadius}' ry='${borderRadius}' stroke='${strokeColor}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
      borderRadius,
    };
  }

  radius(size: Radius | undefined): NullableStyleExpression {
    return !size ? undefined : { borderRadius: this.radii()[size] };
  }

  getRadiusLeft(size: Radius | undefined): NullableStyleExpression {
    if (!size) return;
    return {
      borderBottomLeftRadius: this.radii()[size],
      borderTopLeftRadius: this.radii()[size],
    };
  }

  getRadiusRight(size: Radius | undefined): NullableStyleExpression {
    if (!size) return;
    return {
      borderBottomRightRadius: this.radii()[size],
      borderTopRightRadius: this.radii()[size],
    };
  }

  getRadiusTop(size: Radius | undefined): NullableStyleExpression {
    if (!size) return;
    return {
      borderTopLeftRadius: this.radii()[size],
      borderTopRightRadius: this.radii()[size],
    };
  }

  getRadiusBottom(size: Radius | undefined): NullableStyleExpression {
    if (!size) return;
    return {
      borderBottomLeftRadius: this.radii()[size],
      borderBottomRightRadius: this.radii()[size],
    };
  }

  padding(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { padding: this.spacing()[size] };
  }

  horizontalPadding(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingInline: this.spacing()[size] };
  }

  verticalPadding(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingBlock: this.spacing()[size] };
  }

  paddingLeft(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingLeft: this.spacing()[size] };
  }

  paddingRight(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingRight: this.spacing()[size] };
  }

  paddingTop(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingTop: this.spacing()[size] };
  }

  paddingBottom(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingBottom: this.spacing()[size] };
  }

  border(border: Border | undefined): NullableStyleExpression {
    return !border ? undefined : { border: this.borders()[border] };
  }

  borderTop(border: Border | undefined): NullableStyleExpression {
    return !border ? undefined : { borderTop: this.borders()[border] };
  }

  borderBottom(border: Border | undefined): NullableStyleExpression {
    return !border ? undefined : { borderBottom: this.borders()[border] };
  }

  borderLeft(border: Border | undefined): NullableStyleExpression {
    return !border ? undefined : { borderLeft: this.borders()[border] };
  }

  borderRight(border: Border | undefined): NullableStyleExpression {
    return !border ? undefined : { borderRight: this.borders()[border] };
  }

  boxShadow(shadow: Shadow | undefined) {
    return !shadow ? undefined : { boxShadow: this.shadows()[shadow] };
  }

  gap(gap: OptionalSize): NullableStyleExpression {
    return !gap || gap === 'none' ? undefined : { gap: this.spacing()[gap] };
  }

  zIndex(element: ZIndexableElements | undefined): NullableStyleExpression {
    return !element ? undefined : { zIndex: Z_INDEX[element] };
  }

  borderColor(borderColor: ColorToken): NullableStyleExpression {
    return { borderColor: this.colors()[borderColor] };
  }

  getComponentTheme<T>(componentName: ComponentName) {
    return this.component<T>(componentName);
  }

  // Used to get an "always-defined" options object from a component theme.
  getComponentOptions = <T>(componentName: ComponentName) =>
    linkedSignal({
      source: this.getComponentTheme<T>(componentName),
      computation: () => {
        return this.getComponentTheme<T>(componentName)().options || ({} as T);
      },
    });

  componentOptions = (componentName: ComponentName) =>
    computed(() => this.component(componentName)().options || {});

  style(prop: string, value: string | number | undefined): NullableStyleExpression {
    return !value ? undefined : { [prop]: value };
  }
}
