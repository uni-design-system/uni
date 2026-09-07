import{j as t}from"./jsx-runtime-BmcP-LLi.js";import"./background.component-Xccyhz1u.js";import{T as s}from"./text.component-D3193EcP.js";import"./slide.component-BaXrk8MY.js";import"./iframe-XwEvmobn.js";import"./image.component-DmvAaOlX.js";import"./overlay.component-2RBZ3uSw.js";import"./theming-CiT3o0um.js";import{C as m}from"./card.component-hy5F1vmb.js";import{S as e}from"./stack.component-CsySWHpL.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-CKdrmIqC.js";import"./box.component-Bmg1r5oq.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
