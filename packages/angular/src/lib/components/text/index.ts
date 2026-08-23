export { UniTextDirective } from './text.directive';

/**
 * @deprecated Renamed to `UniTextDirective`. It was a component until 8.5.0;
 * it is a directive now so it can share an element with a layout attribute or
 * a component's own host, which two components could not do (NG0300).
 */
export { UniTextDirective as UniTextComponent } from './text.directive';
