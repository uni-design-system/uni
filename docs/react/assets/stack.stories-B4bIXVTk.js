import{j as t}from"./jsx-runtime-ktpdT-Ni.js";import"./background.component-DK0i26CA.js";import{T as s}from"./text.component-aSWmE1Xz.js";import"./slide.component-DRg0-uMY.js";import"./iframe-DPh57Xk7.js";import"./image.component-D-tP1rxK.js";import"./overlay.component-BkStBB1a.js";import"./theming-BU0Q0uo_.js";import{C as m}from"./card.component-CP4gd3Ok.js";import{S as e}from"./stack.component-CBjqZ8Ew.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-Dri9NagB.js";import"./box.component-D4AFqQU4.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
