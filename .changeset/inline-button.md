---
'@uni-design-system/uni-angular': major
'@uni-design-system/uni-core': major
---

Add `uni-inline-button`, and remove the `footer` component name.

**`uni-inline-button`** is an action that lives inside a sentence. Every other button in the library owns a box — even `ghost` carries padding and a hit area, so dropping one into a paragraph pushes the words apart and breaks the line's rhythm. This one adds no box: it inherits the surrounding type (family, size, weight, line height, letter spacing and colour) and renders as part of the run of text.

```html
Your data is processed under the terms you accepted. You can
<button inline-button underline link>review them</button> at any time.
```

It is always a real `<button>`, so it can *look* like a link without claiming to be navigation: Enter and Space activate it and assistive tech announces a button rather than an unfollowable link. Reach for an `<a>` when the thing actually goes somewhere.

Inputs: `underline` and `link` (both tri-state against the theme's defaults, and both readable as bare attributes), `iconName` / `symbolName` with `iconPosition`, and `disable`. A glyph is sized in `em` rather than px, so the same markup reads correctly in a caption and in a headline and never changes the line height of the paragraph it sits in.

It is themed as **`inlineButton`**, with `linkColor`, `underline`, `underlineOnHover`, `underlineOffset`, `gap` and `focusColor`. This replaces the `textButton` name that had sat in `ComponentName` since before there was anything to put behind it — **`ComponentName`'s `'textButton'` is renamed to `'inlineButton'`, and the exported options type `UniTextButtonOptions` to `UniInlineButtonOptions`.** Nothing shipped a `textButton` entry, so a theme only needs the rename if it had reached for the unbacked name.

One documented limit: browsers blockify every `<button>` to `inline-block` whatever `display` it asks for, so the control is an atomic inline box. A long label wraps inside it, but the run moves to the next line whole rather than splitting where the surrounding words would. `display: contents` would fix that and cost the button its focusability, so labels should stay to a few words.

**`footer` is removed** from `ComponentName` and from the base theme. It was declared and themed but never built, so a theme could set options that reached nothing. Themes that state a `footer` entry now fail to type-check; delete the entry.
