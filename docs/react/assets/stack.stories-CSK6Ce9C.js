import{j as t}from"./jsx-runtime-DV-RmNQI.js";import"./background.component-iX0EHOp4.js";import{T as s}from"./text.component-CbNEv42a.js";import"./slide.component-BE4SbJ4_.js";import"./iframe-CC0P-zhe.js";import"./image.component-DwDaSYkE.js";import"./overlay.component-D2b4vynt.js";import"./theming-GLcDMLDc.js";import{C as m}from"./card.component-C8SXTFxT.js";import{S as e}from"./stack.component-CI9McwMq.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-B6AyMqmT.js";import"./box.component-B2q5Xul6.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
