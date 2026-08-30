---
'@uni-design-system/uni-angular': patch
'@uni-design-system/uni-core': patch
---

Stepper buttons now leave focus in their field, and `uni-quantity-stepper`
follows the theme's field chrome.

**Clicking `+` or `−` focused nothing.** Taking pointer capture means calling
`preventDefault()` on `pointerdown`, which also suppresses the browser's default
focus handling — and the buttons carry `tabindex="-1"`, so focus landed on
`<body>`. The arrow keys then did nothing, exactly when a user reaching for `+`
is most likely to try them. `createPressRepeat` gained a `focus` callback,
invoked on press and handed the pressed button; `uni-number-input` and
`uni-quantity-stepper` point it at their text field, the way a native spinner
does. Where there is no field — a read-only quantity stepper, whose buttons are
themselves the tab stops — focus goes to the button instead. **This affected
`uni-number-input` as well**, not just the stepper.

**`uni-quantity-stepper` ignored a theme's field styling.** It carried its own
`color` / `border` / `borderRadius` tokens, so a theme that restyles `input` —
Wellsourced fills its fields `#F3F2EF` — left the stepper stark white beside
them. Those three now default to the shared `input` chrome and are unset in the
base theme, so the stepper tracks whatever a theme does to its fields; they
remain available as per-component overrides for parting them deliberately. With
the focus indicator and the dividers already sourced this way, the container is
now consistently the field chrome unless a theme says otherwise.
