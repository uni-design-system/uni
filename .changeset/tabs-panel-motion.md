---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

`uni-tabs` softens a tab switch: the incoming panel fades in while the panel animates between the two contents' heights.

Switching between panels of different heights used to cut, and everything below the tabs jumped with it. The panel now travels from the outgoing content's height to the incoming one while the new content fades in. The new content is rendered and interactive from the first frame, so the animation never delays the switch, and a second switch mid-animation picks up from the height the first had reached.

The timing is a new `tabs` theme option, `panelMotion`, naming a motion primitive. The base theme sets it to `panel`, so **this is on by default**; set `panelMotion: undefined` in a theme to keep the instant switch. Under `prefers-reduced-motion` the switch is always instant.
