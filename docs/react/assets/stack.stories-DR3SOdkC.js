import{j as t}from"./jsx-runtime-CukhQt12.js";import"./background.component-5e2PLe9m.js";import{T as s}from"./text.component-C0UBlx8B.js";import"./slide.component-BXZFDCHk.js";import"./iframe-67pwTFkj.js";import"./image.component-DLb31soY.js";import"./overlay.component-BhcgtJko.js";import"./theming-DNlchhpz.js";import{C as m}from"./card.component-1IJ8i3bx.js";import{S as e}from"./stack.component-CKOUesvu.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-pKeF8tNJ.js";import"./box.component-CNVaROlr.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
