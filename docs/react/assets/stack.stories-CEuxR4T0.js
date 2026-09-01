import{j as t}from"./jsx-runtime-D6Wft5m6.js";import"./background.component-D6ZnonYq.js";import{T as s}from"./text.component-CUr_VyBM.js";import"./slide.component-BwwRpVfu.js";import"./iframe-BfYA7p1B.js";import"./image.component-CcJi1Wa3.js";import"./overlay.component-C7p3G0b_.js";import"./theming-BI4W5mQX.js";import{C as m}from"./card.component-Bv7QmYYh.js";import{S as e}from"./stack.component-CC4yZmM2.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-CXXonaii.js";import"./box.component-Du68-QCp.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};const y=["StackedCards"];export{r as StackedCards,y as __namedExportsOrder,j as default};
