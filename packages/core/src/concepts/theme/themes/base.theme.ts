import { Button } from '../../button';
import { Container } from '../../container';
import type { UniTheme } from '../theme.model';

import { genericLightTheme as palette } from '../palettes/theme.palette';
import { toTypefaces, type TextRole, type TextStyle } from '../../typography';

const BaseButton: Button = {
  borderRadius: 100,
  color: 'primary-container',
  contentColor: 'on-primary-container',
  verticalPadding: { xxs: 2, xs: 5, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  horizontalPadding: { xxs: 4, xs: 8, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36 },
};

const BaseContainer: Container = {
  color: 'primary-container',
  contentColor: 'on-primary-container',
  borderRadii: { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 28 },
  horizontalPadding: { xxs: 6, xs: 12, sm: 18, md: 24, lg: 30, xl: 36, xxl: 42 },
  contentSpacing: { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 28 },
};

const BaseTypography: Record<TextRole, TextStyle> = {
  'display-large': {
    fontFamily: 'Red Hat Display',
    fontSize: 57,
    lineHeight: 64,
    fontWeight: 'normal',
    letterSpacing: -0.25,
  },
  'display-medium': {
    fontFamily: 'Red Hat Display',
    fontSize: 45,
    lineHeight: 52,
    fontWeight: 'normal',
  },
  'display-small': {
    fontFamily: 'Red Hat Display',
    fontSize: 36,
    lineHeight: 44,
    fontWeight: 'normal',
  },
  'headline-large': {
    fontFamily: 'Red Hat Display',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 'normal',
  },
  'headline-medium': {
    fontFamily: 'Red Hat Display',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: 'normal',
  },
  'headline-small': {
    fontFamily: 'Red Hat Display',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'normal',
  },
  'title-large': {
    fontFamily: 'Red Hat Display',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 'normal',
  },
  'title-medium': {
    fontFamily: 'Red Hat Display',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'medium',
    letterSpacing: 0.15,
  },
  'title-small': {
    fontFamily: 'Red Hat Display',
    fontWeight: 'medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  'body-1-long': {
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 22,
  },
  'body-1-short': {
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 24,
  },
  'body-2-long': {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 18,
  },
  'body-2-short': {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 20,
  },
  'subtitle-1': {
    fontFamily: 'Red Hat Display',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  'subtitle-2': {
    fontFamily: 'Red Hat Display',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'medium',
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontFamily: 'Red Hat Display',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'medium',
    textTransform: 'capitalize',
  },
  caption: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  overline: {
    fontFamily: 'Red Hat Display',
    fontSize: 10,
    lineHeight: 18,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  paragraph: {
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 24,
  },
  quote: {
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 24,
  },
  note: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
};

export const BaseTheme: UniTheme = {
  id: 'BaseTheme',
  name: 'Base Theme',
  colors: {
    primary: '#6750A4',
    'on-primary': '#FFFFFF',
    'primary-container': '#EADDFF',
    'on-primary-container': '#21005E',
    secondary: '#625B71',
    'on-secondary': '#FFFFFF',
    'secondary-container': '#E8DEF8',
    'on-secondary-container': '#1E192B',
    tertiary: '#7D5260',
    'on-tertiary': '#FFFFFF',
    'tertiary-container': '#FFD8E4',
    'on-tertiary-container': '#370B1E',
    error: '#B3261E',
    'on-error': '#FFFFFF',
    'error-container': '#F9DEDC',
    'on-error-container': '#370B1E',
    background: '#FFFBFE',
    'on-background': '#1C1B1F',
    surface: '#FFFBFE',
    'on-surface': '#1C1B1F',
    'surface-variant': '#E7E0EC',
    'on-surface-variant': '#49454E',
    outline: '#79747E',
    shadow: '#000000',
    'surface-tint': '#6750A4',
    'inverse-surface': '#313033',
    'on-inverse-surface': '#F4EFF4',
    'on-inverse-surface-primary': '#D0BCFF',
    scrim: '#000000',
    transparent: 'rgba(0,0,0,0)',
    ghost: 'rgba(0,0,0,0)',

    quaternary: '#79747E',
    'on-quaternary': '#FFFFFF',
    warn: '#B3261E',
    'on-warn': '#FFFFFF',
    success: '#2E7D32',
    'on-success': '#FFFFFF',
    disabled: 'rgba(0,0,0,0.12)',
    'on-disabled': 'rgba(0,0,0,0.38)',

    'on-primary-container-variant': 'rgba(0,0,0,0.4)',
    'on-primary-container-border': '#6750A4',
    'on-secondary-container-variant': 'rgba(0,0,0,0.4)',
    'on-secondary-container-border': '#625B71',
    'on-tertiary-container-variant': 'rgba(0,0,0,0.4)',
    'on-tertiary-container-border': '#7D5260',

    'warn-container': '#F9DEDC',
    'on-warn-container': '#8C1D18',
    'on-warn-container-variant': 'rgba(0,0,0,0.4)',
    'on-warn-container-border': '#8C1D18',

    'success-container': '#C6F0CD',
    'on-success-container': '#1E5128',
    'on-success-container-variant': 'rgba(0,0,0,0.4)',
    'on-success-container-border': '#1E5128',

    'disabled-container': '#F2F2F2',
    'on-disabled-container': 'rgba(0,0,0,0.38)',

    'inverse-container': '#313033',
    'on-inverse-container': '#F4EFF4',

    'primary-surface': palette.background,
    'on-primary-surface': palette.onLight,
    'on-primary-surface-variant': palette.primary,

    'secondary-surface': '#F3EDF7',
    'on-secondary-surface': '#1C1B1F',
    'on-secondary-surface-variant': '#6750A4',

    'tertiary-surface': '#F2F2F2',
    'on-tertiary-surface': '#1C1B1F',
    'on-tertiary-surface-variant': '#6750A4',

    'quaternary-surface': '#E8DEF8',
    'on-quaternary-surface': '#1C1B1F',
    'on-quaternary-surface-variant': '#6750A4',

    'disabled-surface': 'rgba(0,0,0,0.12)',
    'on-disabled-surface': 'rgba(0,0,0,0.5)',
    'on-disabled-surface-variant': 'rgba(0,0,0,0.4)',

    'on-inverse-surface-variant': '#D0BCFF',
    'on-background-variant': '#959595',
  },
  typography: BaseTypography,
  borders: {
    primary: `1px solid ${palette.primary}`,
    secondary: `1px solid ${palette.secondary}`,
    tertiary: `1px solid ${palette.tertiary}`,
    quaternary: `1px solid ${palette.quaternary}`,
    warn: `1px solid ${palette.warn}`,
    success: `1px solid ${palette.secondary}`,
    light: `1px solid ${palette.light}`,
    dark: `1px solid ${palette.dark}`,
    dotted: `1px dotted ${palette.dark}`,
  },

  shadows: {
    raised:
      'rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px',
    menu: 'rgba(0, 0, 0, 0.2) 0px 3px 3px -2px, rgba(0, 0, 0, 0.14) 0px 3px 4px 0px, rgba(0, 0, 0, 0.12) 0px 1px 8px 0px;',
    dialog:
      'rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 18px 0px',
    warn: '0 0 5px rgba(255, 0, 0, 0.5), inset 0 0 5px rgba(255, 0, 0, 0.3)',
  },

  spacing: {
    none: 'none',
    xxs: '2px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '32px',
    xl: '64px',
  },

  thicknesses: {
    thin: 1,
    standard: 2,
    thick: 4,
  },

  radii: {
    none: 'none',
    xxs: '4px',
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    max: '999px',
  },
  buttons: {
    elevated: {
      ...BaseButton,
      color: 'surface',
      contentColor: 'on-surface',
      shadowElevation: 'raised',
    },
    filled: {
      ...BaseButton,
      color: 'primary',
    },
    'filled-secondary': {
      ...BaseButton,
      color: 'secondary',
      contentColor: 'on-secondary',
    },
    outlined: {
      ...BaseButton,
      color: 'transparent',
      borderColor: 'primary',
      contentColor: 'on-primary',
      borderWidth: 1,
    },
    text: {
      ...BaseButton,
      color: 'transparent',
      contentColor: 'on-surface',
    },
    icon: {
      ...BaseButton,
      color: 'transparent',
      contentColor: 'on-surface',
      horizontalPadding: BaseButton.verticalPadding,
    },
    'floating-action': {
      ...BaseButton,
      color: 'secondary',
      contentColor: 'on-secondary',
      borderRadii: { xxs: 3, xs: 5, sm: 8, md: 12, lg: 16, xl: 12, xxl: 20 },
      shadowElevation: 'navigation',
      verticalPadding: { xxs: 4, xs: 8, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36 },
      horizontalPadding: { xxs: 4, xs: 8, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36 },
    },
  },
  containers: {
    card: {
      ...BaseContainer,
      color: 'surface',
      contentColor: 'on-surface',
      shadowMode: 'interactive',
    },
    screen: {
      ...BaseContainer,
      color: 'background',
      contentColor: 'on-background',
    },
    modal: {
      ...BaseContainer,
      borderRadii: { xxs: 8, xs: 16, sm: 22, md: 28, lg: 32, xl: 38, xxl: 44 },
      color: 'surface',
      contentColor: 'on-surface',
      shadowMode: 'static',
      shadowElevation: 'modal',
      maxWidth: 560,
    },
  },
  typefaces: {
    ...toTypefaces(BaseTypography),
    badge: {
      fontFamily: 'Red Hat Display',
      fontSize: '16px',
      lineHeight: '24px',
    },
    tag: {
      fontFamily: 'Red Hat Display',
      fontSize: '15px',
      lineHeight: '20px',
      fontWeight: 600,
    },
    input: {
      fontFamily: 'Red Hat Display',
      fontSize: '14px',
      lineHeight: '24px',
    },
  },
  icons: {},
  components: {
    alert: {
      options: {
        topPosition: 40,
        borderRadius: 'sm',
        transitionSpeed: 0.35,
        elevation: 'md',
      },
    },
    checkbox: {
      options: {
        size: 20,
      },
    },
    dialog: {
      options: {
        borderRadius: 'lg',
        color: 'primary-surface',
        border: 'quaternary',
        padding: 'sm',
        elevation: 'dialog',
        backdrop: {
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(2px)',
        },
      },
    },
    dialogHeader: {
      options: {
        borderRadius: 'max',
        color: 'primary',
        height: 48,
        textRole: 'title-large',
        textAlign: 'center',
        closeButtonIcon: 'close',
        closeButtonSize: 'md',
      },
    },
    dropdown: {
      options: {
        border: 'none',
        borderRadius: 'xxs',
        color: 'primary-surface',
        shadow: 'menu',
      },
    },
    footer: {
      options: {
        height: 52,
        color: 'primary',
        logoHeight: 18.6,
        logoPadding: 'md',
      },
    },
    input: {
      options: {
        typeFace: 'input',
        color: 'primary-surface',
        textColor: 'on-primary-surface',
        disabledColor: 'disabled-surface',
        disabledTextColor: 'on-disabled-surface',
        border: 'light',
        borderRadius: 'xs',
        errorShadow: 'warn',
        errorBorder: 'warn',
        height: 32,
        paddingLeft: 'sm',
        focusOutline: `2px solid ${palette.primary}`,
        focusOutlineOffset: 2,
      },
    },
    multiSelectDropdown: {
      options: {
        textRole: 'input',
        textColor: 'on-primary-surface',
        dividerBorder: 'light',
        searchInputBorder: 'light',
        searchInputBorderRadius: 'xxs',
        focusOutline: `2px solid ${palette.primary}`,
        focusOutlineOffset: 2,
      },
    },
    badge: {
      options: {
        borderRadius: 'xxs',
      },
    },
    button: {
      fixed: {
        position: 'relative',
        overflow: 'hidden',
        outline: '0',
        border: '0',
        cursor: 'pointer',
        fontFamily: 'Euphemia, sans-serif',
        transition: 'all 0.28s ease',
      },
      colors: {
        ghost: {
          backgroundColor: 'transparent',
          color: 'currentcolor',
        },
        primary: {
          backgroundColor: palette.primary,
          color: palette.onDark,
        },
        secondary: {
          backgroundColor: palette.secondary,
          color: palette.onDark,
        },
        tertiary: {
          backgroundColor: palette.tertiary,
          color: palette.onDark,
        },
        warn: {
          backgroundColor: palette.warn,
          color: palette.onDark,
        },
        disabled: {
          backgroundColor: `${palette.disabled} !important`,
          color: '#fff !important',
        },
        success: {
          backgroundColor: palette.success,
          color: palette.onDark,
        },
      },
      sizes: {
        sm: {
          height: 22,
          borderRadius: 11,
          fontSize: 12,
          padding: '0 12px',
          fontFamily: 'Euphemia Bold, sans-serif',
          fontWeight: 600,
        },
        md: {
          height: 26,
          borderRadius: 13,
          fontSize: 16,
          padding: '0 16px',
        },
        lg: {
          height: 36,
          borderRadius: 18,
          fontSize: 18,
          padding: '0 18px',
        },
        xl: {
          height: 48,
          borderRadius: 24,
          fontSize: 24,
          padding: '0 22px',
        },
      },
    },
    iconButton: {
      colors: {
        ghost: {
          backgroundColor: 'transparent',
          color: 'currentcolor',
        },
        primary: {
          backgroundColor: palette.primary,
          color: palette.onDark,
        },
        secondary: {
          backgroundColor: palette.secondary,
          color: palette.onDark,
        },
        tertiary: {
          backgroundColor: palette.tertiary,
          color: palette.onDark,
        },
        warn: {
          backgroundColor: palette.warn,
          color: palette.onDark,
        },
        success: {
          backgroundColor: palette.success,
          color: palette.onDark,
        },
        disabled: {
          backgroundColor: 'transparent !important',
          color: 'rgba(0,0,0,0.25) !important',
        },
      },
      sizes: {
        sm: {
          height: 22,
          minHeight: 22,
          width: 22,
          minWidth: 22,
          fontSize: 18,
        },
        md: {
          height: 26,
          minHeight: 26,
          width: 26,
          minWidth: 26,
          fontSize: 22,
        },
        lg: {
          height: 36,
          minHeight: 36,
          width: 36,
          minWidth: 36,
          fontSize: 30,
        },
        xl: {
          height: 40,
          minHeight: 40,
          width: 40,
          minWidth: 40,
          fontSize: 34,
        },
      },
    },
    progressGauge: {
      fixed: {
        textFill: palette.onLight,
      },
      colors: {
        primary: {
          backgroundColor: '#b3d4ea',
          color: palette.primary,
        },
        secondary: {
          backgroundColor: '#b3e7c2',
          color: palette.secondary,
        },
        tertiary: {
          backgroundColor: '#ffe2b3',
          color: palette.tertiary,
        },
        warn: {
          backgroundColor: '#ffc2b3',
          color: palette.warn,
        },
        success: {
          backgroundColor: '#b3e7c2',
          color: palette.success,
        },
      },
      sizes: {
        sm: { height: '54px' },
        md: { height: '68px' },
        lg: { height: '82px' },
        xl: { height: '104px' },
      },
    },
    card: {
      fixed: {
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRadius: '8px',
        overflow: 'hidden',
      },
      colors: {
        primary: {
          borderColor: palette.primary,
          backgroundColor: palette.background,
        },
        secondary: {
          borderColor: palette.secondary,
          backgroundColor: palette.background,
        },
        tertiary: {
          borderColor: palette.tertiary,
          backgroundColor: palette.background,
        },
        warn: {
          borderColor: palette.warn,
          backgroundColor: palette.background,
        },
        success: {
          borderColor: palette.success,
          backgroundColor: palette.background,
        },
      },
    },
    cardHeader: {
      fixed: { padding: '12px 24px' },
      colors: {
        primary: {
          backgroundColor: palette.primary,
          color: palette.onDark,
        },
        secondary: {
          backgroundColor: palette.secondary,
          color: palette.onDark,
        },
        tertiary: {
          backgroundColor: palette.tertiary,
          color: palette.onDark,
        },
        warn: {
          backgroundColor: palette.warn,
          color: palette.onDark,
        },
        success: {
          backgroundColor: palette.success,
          color: palette.onDark,
        },
      },
    },
    cardContent: {
      fixed: {
        padding: '12px 24px',
      },
    },
    dataSearch: {
      options: {
        border: 'light',
        borderRadius: 'xs',
        color: 'primary-surface',
        placeholderColor: 'disabled',
      },
    },
    dataTable: {
      options: {
        color: 'primary-surface',
        border: 'light',
        borderRadius: 'sm',
        elevation: undefined,
        headerPadding: 'sm',
        footerPadding: 'sm',
        thTextRole: 'headline-small',
        thColor: 'primary-container',
        thVerticalBorder: 'dotted',
        thHorizontalBorder: 'light',
        thPadding: 'sm',
        tdTextRole: 'title-small',
        tdColor: 'primary-surface',
        tdStickyColor: 'primary-container',
        tdPadding: 'sm',
        tdVerticalBorder: 'dotted',
        tdHorizontalBorder: 'light',
        rowHoverColor: 'primary-container',
        loadingOverlayColor: 'scrim',
        loadingSpinnerColor: 'primary',
        loadingSpinnerSize: 40,
      },
    },
    notificationBadge: {
      options: {
        borderRadius: 'sm',
        offset: -10,
      },
    },
    paginator: {
      options: {
        gap: 'xs',
        textRole: 'label',
        inputBorder: 'light',
        inputBorderRadius: 'xs',
        pageBorderRadius: 'xs',
        currentPageBorder: 'light',
        currentPageBorderRadius: 'xs',
      },
    },
    snackbar: {
      options: {
        bottomPosition: 40, // px
        transitionDelay: '0.35s', // ms
        autoCloseDelay: 35000, // ms
      },
    },
    symbol: {
      options: {
        fill: 0,
        weight: 400,
        grade: 0,
        opticalSize: 24,
      },
    },
    toggle: {
      options: {
        size: 20,
      },
    },
    tooltip: {
      options: {
        border: undefined,
        borderRadius: 'xs',
        shadow: 'raised',
        color: 'inverse-surface',
        typeface: 'label',
      },
    },
  },
};
