export { UniBoxDirective } from './box/box.directive';
export { UniCenterDirective } from './center/center.directive';
export { UniGridAreaDirective } from './grid/grid-area/grid-area.directive';
export { UniGridDirective } from './grid/grid.directive';
export { UniRowDirective } from './row/row.directive';
export { UniStackDirective } from './stack/stack.directive';
export { UniWrapDirective } from './wrap/wrap.directive';

/*
 * Deprecated aliases. The layout primitives were components until 8.5.0; they
 * are directives now so they can share an element with each other, with
 * `uni-text`, and with a component's own host. The classes are otherwise
 * unchanged, so `imports: [UniBoxComponent]` keeps working.
 */
/** @deprecated Renamed to `UniBoxDirective`. */
export { UniBoxDirective as UniBoxComponent } from './box/box.directive';
/** @deprecated Renamed to `UniCenterDirective`. */
export { UniCenterDirective as UniCenterComponent } from './center/center.directive';
/** @deprecated Renamed to `UniGridAreaDirective`. */
export { UniGridAreaDirective as UniGridAreaComponent } from './grid/grid-area/grid-area.directive';
/** @deprecated Renamed to `UniGridDirective`. */
export { UniGridDirective as UniGridComponent } from './grid/grid.directive';
/** @deprecated Renamed to `UniRowDirective`. */
export { UniRowDirective as UniRowComponent } from './row/row.directive';
/** @deprecated Renamed to `UniStackDirective`. */
export { UniStackDirective as UniStackComponent } from './stack/stack.directive';
/** @deprecated Renamed to `UniWrapDirective`. */
export { UniWrapDirective as UniWrapComponent } from './wrap/wrap.directive';
