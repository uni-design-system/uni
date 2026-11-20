import{j as t}from"./jsx-runtime-NolJ_E3e.js";import"./background.component-B75UeEzC.js";import{T as s}from"./text.component-DdNS3has.js";import"./slide.component-AY22UHDf.js";import"./iframe-BwQlGZe3.js";import"./image.component-B8WQJc9J.js";import"./overlay.component-d7kEmflN.js";import"./theming-BXzFroeb.js";import{C as m}from"./card.component-DzApXR2Y.js";import{S as e}from"./stack.component-Ce3GPRdj.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-CvIkHqjg.js";import"./box.component-CllBxmby.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
