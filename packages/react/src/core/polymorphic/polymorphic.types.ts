import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ElementType,
  ReactElement,
} from 'react';

/**
 * The `as` prop every layout primitive accepts. Angular applies layout as an
 * attribute (`<main box-layout>`) so the element's semantics stay the author's;
 * React's equivalent is `as`: `<Box as="main">`.
 */
export type AsProp<E extends ElementType> = { as?: E };

type PropsToOmit<E extends ElementType, P> = keyof (AsProp<E> & P);

/** Own props + the rendered element's own props, minus anything we shadow. */
export type PolymorphicProps<E extends ElementType, P> = P &
  AsProp<E> &
  Omit<ComponentPropsWithoutRef<E>, PropsToOmit<E, P>>;

/** The ref type of whatever element `as` resolves to. */
export type PolymorphicRef<E extends ElementType> = ComponentPropsWithRef<E>['ref'];

export type PolymorphicPropsWithRef<E extends ElementType, P> = PolymorphicProps<E, P> & {
  ref?: PolymorphicRef<E>;
};

/**
 * The callable shape of a polymorphic, ref-forwarding component. `forwardRef`
 * erases the generic, so components are cast to this after creation.
 */
export interface PolymorphicComponent<P, D extends ElementType = 'div'> {
  <E extends ElementType = D>(props: PolymorphicPropsWithRef<E, P>): ReactElement | null;
  displayName?: string;
}
