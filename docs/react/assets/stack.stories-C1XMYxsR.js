import{j as t}from"./jsx-runtime-DCcQyHCJ.js";import"./background.component-C1FCsZKO.js";import{T as s}from"./text.component-riHEULU0.js";import"./slide.component-B3W_gWZ8.js";import"./iframe-D7mHC4v3.js";import"./image.component-C9Kx_QaB.js";import"./overlay.component-D2WYBsHd.js";import"./theming-BXNJ300A.js";import{C as m}from"./card.component-ClB2Fzsz.js";import{S as e}from"./stack.component-qzxJW6tB.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-I4amXsDB.js";import"./box.component-C0aGEYxD.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
