import{j as t}from"./jsx-runtime-CQq7yVyG.js";import"./background.component-DWvfh2bO.js";import{T as s}from"./text.component-CMLbkc6h.js";import"./slide.component-BNdROZiE.js";import"./iframe-D0ya2Ihz.js";import"./image.component-DKJAUzJK.js";import"./overlay.component-DOR5ubHc.js";import"./theming-VbNyXXi1.js";import{C as m}from"./card.component-BFeazypL.js";import{S as e}from"./stack.component-DgQvE4t7.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-MPy890pR.js";import"./box.component-D8aX8tW1.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
