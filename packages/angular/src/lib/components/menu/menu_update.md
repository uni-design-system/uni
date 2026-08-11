uni-menu: first item appears pre-highlighted when the menu is opened with a pointer

When a uni-menu is opened by mouse click, the first menu item renders with the hover highlight before the pointer has touched any item. Two behaviors combine to cause this:

1. UniMenuComponent.onOpened() implements ARIA roving focus: on every open it calls .focus() on the first navigable item (pendingFocus defaults to 'first'; ArrowUp-open targets the last item). This runs for pointer opens as well as keyboard opens.
2. UniMenuItemComponent's Emotion styles intentionally paint focus the same as hover — the rule is '&:hover, &:focus': colorPair(hoverColor) (commented "Roving focus highlights items the same way hover does").

The roving focus itself is correct and should stay — keyboard users need the focus cursor. The problem is only visual: programmatic focus after a pointer open matches :focus, so mouse users see a highlight they didn't cause, which reads as a preselected/default item.

Proposed fix: in UniMenuItemComponent's styles, change the highlight selector from '&:hover, &:focus' to '&:hover, &:focus-visible', and make the same substitution in any variant that overrides the pair with a same-key rule (e.g. the warn variant's '&:hover, &:focus' override). Programmatic focus following a mouse click does not match :focus-visible, while keyboard-driven focus (Enter/Space/ArrowDown/ArrowUp on the trigger, arrow-key navigation inside the menu) does — so this removes the phantom highlight for pointer users without losing the keyboard focus indicator.

Acceptance criteria:
- Open a menu by mouse click: no item is highlighted until the pointer hovers one.
- Open a menu with Enter/ArrowDown: the first item is visibly highlighted; ArrowUp-open highlights the last item.
- Arrow-key navigation inside an open menu moves the visible highlight as before.
- The warn (and any other) menu-item variant behaves the same way.
- Focus bookkeeping is unchanged — only the CSS selector moves from :focus to :focus-visible; onOpened()/navigableItems logic stays as is.
