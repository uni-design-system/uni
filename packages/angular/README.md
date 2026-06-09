<p align="center">
  <a href="https://uni-design-system.github.io/uni/" target="_blank">
    <img src="https://github.com/uni-design-system/uni-react/raw/v0.0.17/.github/uni-logo.png" alt="UNI Design System">
  </a>
</p>

<p align="center">
  UNI Angular is a themed based component library built atop of the UNI Design System Core Concepts.
<p>

<p align="center">
  <a href="https://uni-design-system.github.io/uni/docs/angular/"><strong>Browse the Angular (v21) component library &rarr;</strong></a>
</p>

# @uni-design-system/uni-angular

The official **Angular** implementation of the Uni Design System. Built from the ground up for modern enterprise apps, this package delivers strict, performance-optimized structural components.

## 📦 Installation

```bash
npm install @uni-design-system/uni-angular @uni-design-system/uni-core @emotion/css
```

_Note: This package requires `@emotion/css` to be present in the host application as a peer dependency._

## 🏁 Getting Started

This library utilizes fully standalone components compliant with modern Angular architectures. Simply import the component into your Standalone Component or Angular Module:

### 1. Import Component

```typescript
import { Component } from '@angular/core';
import { ButtonComponent } from '@uni-design-system/uni-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonComponent], // 🟢 Inject here
  template: ` <uni-button text="Hello Uni!" (click)="handleOnClick()"> </uni-button> `,
})
export class AppComponent {
  handleOnClick() {
    console.log('Button clicked!');
  }
}
```

## 🛠️ Architecture Profile

- **Framework Support:** Angular `^21.2.0`
- **Package Format:** Compiled strictly under the **Angular Package Format (APF)** using `ng-packagr` into flat, optimized `fesm2022` modules.
- **CSS Architecture:** Leverages native CSS properties and token maps for high-performance hardware rendering, avoiding heavy deprecated runtime framework animation libraries.
