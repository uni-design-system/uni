# @uni-design-system/uni-react

The official **React** implementation of the Uni Design System. This library features highly interactive, accessible, and performant components styled cleanly using tokens from our core engine.

## 📦 Installation

```bash
npm install @uni-design-system/uni-react @uni-design-system/uni-core
```

## 🏁 Getting Started

Ensure you wrap or initialize your application layout to handle tokens from `@uni-design-system/uni-core` if needed, then import and drop components directly into your TSX:

```tsx
import React from 'react';
import { Button } from '@uni-design-system/uni-react';

export const MyComponent = () => {
  return (
    <Button 
      type="primary" 
      onClick={() => console.log('Clicked!')}
    >
      Click Me
    </Button>
  );
};
```

## 🛠️ Architecture Profile
- **Framework Support:** React `>=18`
- **Pre-bundled Internals:** Complex third-party layout engines (like `@dnd-kit` and `framer-motion`) are completely compiled *inside* this package to simplify your build trees.
- **Peer Dependencies:** React and `@uni-design-system/uni-core` are kept external to maintain minimal, lightweight bundle weights.
```
