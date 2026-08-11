/**
 * The highlight state for roving-focus composites (menus, and any other widget
 * that moves focus programmatically): pointer hover, or focus the user drove
 * from the keyboard.
 *
 * Why not plain `:focus` — a roving-focus composite calls `.focus()` on an item
 * every time it opens, including pointer opens, and `:focus` would paint that
 * as a highlight the mouse user never asked for, reading as a preselected
 * item. `:focus-visible` excludes programmatic focus that follows a click while
 * still matching keyboard navigation.
 *
 * Shared as a constant because Emotion merges styles by **exact selector
 * text**: a component's base rule and any theme variant restyling that rule
 * must key both with this value, or the variant silently fails to override and
 * reintroduces the phantom highlight.
 */
export const HOVER_OR_KEYBOARD_FOCUS = '&:hover, &:focus-visible';
