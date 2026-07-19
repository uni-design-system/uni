<p align="center">
  <a href="https://uni-design-system.github.io/uni/" target="_blank">
    <img src="https://github.com/uni-design-system/uni-react/raw/v0.0.17/.github/uni-logo.png" alt="UNI Design System">
  </a>
</p>

<p align="center">
  UNI Angular is a theme-based component library built atop the UNI Design System core concepts.
<p>

<p align="center">
  <a href="https://www.npmjs.com/package/@uni-design-system/uni-angular"><img src="https://img.shields.io/npm/v/%40uni-design-system%2Funi-angular" alt="npm version"></a>
  <a href="https://github.com/uni-design-system/uni/actions/workflows/ci.yml"><img src="https://github.com/uni-design-system/uni/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>

<p align="center">
  <a href="https://uni-design-system.github.io/uni/docs/angular/"><strong>Browse the Angular component library &rarr;</strong></a>
</p>

# @uni-design-system/uni-angular

The official **Angular** implementation of the UNI Design System: ~50 themed,
accessible, standalone components with a **signals-only API** — signal inputs,
`model()` two-way bindings, zoneless-ready `OnPush` change detection, and
first-class **Signal Forms** integration. No rxjs, no NgModules, no CVA.

## 📦 Installation

```bash
npm install @uni-design-system/uni-angular @uni-design-system/uni-core @emotion/css
```

`@emotion/css` and `@uni-design-system/uni-core` are peer dependencies of the
host application.

## 🏁 Getting Started

Every component is standalone — import the class and use its selector:

```typescript
import { Component } from '@angular/core';
import { UniButtonComponent } from '@uni-design-system/uni-angular';

@Component({
  selector: 'app-root',
  imports: [UniButtonComponent],
  template: `
    <button uni-text-button variant="primary" (click)="handleClick()">Hello UNI!</button>
  `,
})
export class AppComponent {
  handleClick() {
    console.log('Button clicked!');
  }
}
```

Theming works out of the box — the built-in themes are provided by default.
To register your own:

```typescript
import { UNI_THEMES } from '@uni-design-system/uni-angular';
import { UniThemes } from '@uni-design-system/uni-core';

export const appConfig = {
  providers: [{ provide: UNI_THEMES, useValue: { ...UniThemes, myTheme } }],
};
```

## ✍️ Signal Forms

Form controls (`Input`, `Checkbox`, `Radio`, `Toggle`, `SelectInput`,
`MultiSelectDropdown`) implement Angular's Signal Forms
`FormValueControl`/`FormCheckboxControl` interfaces — bind them straight to a
field with `[field]`, no ControlValueAccessor involved:

```typescript
import { Component, signal } from '@angular/core';
import { form, required, minLength } from '@angular/forms/signals';
import { UniCheckboxComponent, UniInputComponent } from '@uni-design-system/uni-angular';

@Component({
  selector: 'app-signup',
  imports: [UniInputComponent, UniCheckboxComponent],
  template: `
    <uni-input label="Username" [field]="signupForm.username" />
    <uni-checkbox label="Accept terms" [field]="signupForm.terms" />
  `,
})
export class SignupComponent {
  readonly formState = signal({ username: '', terms: false });

  readonly signupForm = form(this.formState, {
    username: [required(), minLength(3)],
    terms: [required()],
  });
}
```

Outside a form, every control also supports plain two-way binding:
`<uni-checkbox [(checked)]="agreed" />`.

## 🔤 Selectors

Every component registers a **canonical `uni-`-prefixed selector** plus a short
alias. Use the canonical form in application code; the aliases exist for
terse internal/demo markup.

| Component | Canonical                  | Alias                    |
| --------- | -------------------------- | ------------------------ |
| Button    | `button[uni-text-button]`  | `button[text-button]`, `Button` |
| Checkbox  | `uni-checkbox`             | `Checkbox`               |
| Dialog    | `dialog[uni-dialog]`       | `Dialog`                 |
| Box       | `div[uni-box-layout]`      | `div[box-layout]`, `Box` |

The full selector list for every component is in [`llms.txt`](./llms.txt).

## ♿ Accessibility

The library targets **WCAG 2.2 AA**: full keyboard support (menus, tables,
dialogs, tooltips), ARIA contracts on every component, reduced-motion support,
and screen-reader announcements for badges, alerts, and progress. See
[ACCESSIBILITY.md](./ACCESSIBILITY.md) for per-component keyboard maps and the
contracts your app is expected to fulfill (e.g. labelling icon-only buttons).

## 🤖 AI-agent friendly

A generated, always-current API reference lives in [`llms.txt`](./llms.txt) —
selectors, inputs (with types and defaults), two-way models, and outputs for
every component. Point your coding agent at it. Regenerate with
`pnpm docs:api`. Conventions for contributors (human or agent) are in
[AGENTS.md](./AGENTS.md).

## 🛠️ Architecture Profile

- **Framework support:** Angular `^21.2.0` (zoneless-ready; every component is `OnPush`)
- **Package format:** Angular Package Format (APF) via `ng-packagr`, flat `fesm2022`
- **Styling:** [Emotion](https://emotion.sh/docs/@emotion/css) atomic CSS from
  theme tokens — no global stylesheets, no CSS files to import
- **Positioning:** native Popover API + `@floating-ui/dom` (the package's only
  runtime dependency)
- **Testing:** Vitest (zoneless TestBed), ESLint with template accessibility
  rules and a hard ban on legacy decorator APIs

## 🗓️ Versioning & Support

- Follows [semver](https://semver.org) with
  [changesets](https://github.com/changesets/changesets); see
  [CHANGELOG.md](./CHANGELOG.md).
- Each major of this package tracks one Angular major (current: Angular 21).
  Previous majors receive fixes for six months after the next major ships.
