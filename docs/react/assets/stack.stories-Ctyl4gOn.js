import{j as t}from"./jsx-runtime-B8a3h9MQ.js";import"./background.component-DwMxEcAR.js";import{T as s}from"./text.component-DMrqRnr_.js";import"./slide.component-Dk975lWa.js";import"./iframe-C8RG7Hve.js";import"./image.component-CbND1mri.js";import"./overlay.component-CAlXZVQ8.js";import"./theming-BqerdPHD.js";import{C as m}from"./card.component-BZqjSxPY.js";import{S as e}from"./stack.component-Kr9nZYeB.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-DQpi6VRK.js";import"./box.component-DKyZbO7A.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};const y=["StackedCards"];export{r as StackedCards,y as __namedExportsOrder,j as default};
