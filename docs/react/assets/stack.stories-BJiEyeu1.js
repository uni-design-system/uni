import{j as t}from"./jsx-runtime-BFQYTiIK.js";import"./background.component-CcNJs86C.js";import{T as s}from"./text.component-DJ-A3fN8.js";import"./slide.component-Bf0_q79Y.js";import"./iframe-6sRvOqMq.js";import"./image.component-BqwmmIFw.js";import"./overlay.component-BZzB5R_1.js";import"./theming-BQAouRa3.js";import{C as m}from"./card.component-pz2opTG_.js";import{S as e}from"./stack.component-Yyj6son4.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-2_7Nvy9K.js";import"./box.component-GEpUB2wK.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
