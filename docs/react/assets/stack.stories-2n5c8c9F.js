import{j as t}from"./jsx-runtime-DmSuX0wB.js";import"./background.component-_7PY-Y9q.js";import{T as s}from"./text.component-Bsp1sD5S.js";import"./slide.component-DlTqhVK2.js";import"./iframe-PAiZeGMy.js";import"./image.component-KodzKTUS.js";import"./overlay.component-BV2SMYOv.js";import"./theming-BHKfFs-L.js";import{C as m}from"./card.component-CgjLeQaz.js";import{S as e}from"./stack.component-BMrHLPqJ.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-BR94ECyn.js";import"./box.component-CDpma7Mr.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
