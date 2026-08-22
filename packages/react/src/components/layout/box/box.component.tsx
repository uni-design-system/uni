import React, { forwardRef, type ElementType, type ReactNode } from 'react';
import { cx } from '@emotion/css';

import type { PolymorphicComponent, PolymorphicProps } from '../../../core/polymorphic';
import { ContainerContext } from '../../../core/container';
import { splitBoxProps, useBoxClassName, type BoxStyleProps } from './box.styles';

export interface BoxOwnProps extends BoxStyleProps {
  /** The element to render. Defaults to `div`; use it to keep semantics: `as="main"`. */
  as?: ElementType;
  children?: ReactNode;
  className?: string;
}

export type BoxProps<E extends ElementType = 'div'> = PolymorphicProps<E, BoxOwnProps>;

/**
 * The base layout primitive. Every other layout component is a Box with
 * presets, and Box itself renders whatever element you name so the semantics
 * stay yours: `<Box as="main" grow={1} padding="md">`.
 *
 * Sizing convention (height/width/min/max/inset): a **number is px** —
 * `height={420}`; a **string is a CSS length** — `height="50%"`.
 * Spacing/radius/border/shadow/color props take theme tokens.
 */
export const Box = forwardRef<Element, BoxOwnProps>(function Box(
  { as, className, children, ...props },
  ref
) {
  const Component = (as || 'div') as ElementType;
  const [styleProps, rest] = splitBoxProps(props as BoxStyleProps);
  const boxClass = useBoxClassName(styleProps);

  const element = (
    <Component ref={ref} className={cx(boxClass, className)} {...rest}>
      {children}
    </Component>
  );

  // A box that paints a container color becomes the container its descendants
  // read their on-color from — the React stand-in for CSS color inheritance.
  return styleProps.color ? (
    <ContainerContext.Provider value={{ colorToken: styleProps.color }}>
      {element}
    </ContainerContext.Provider>
  ) : (
    element
  );
}) as PolymorphicComponent<BoxOwnProps>;

Box.displayName = 'Box';
