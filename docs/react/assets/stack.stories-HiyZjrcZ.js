import{j as t}from"./jsx-runtime-Oa7rHVvf.js";import"./background.component-DvgdtKes.js";import{T as s}from"./text.component-BguqKKj9.js";import"./slide.component-2tgY2dEw.js";import"./iframe-DckPpy46.js";import"./image.component-BBbVvA4O.js";import"./overlay.component-CKD_QmFw.js";import"./theming-C32jxOEN.js";import{C as m}from"./card.component-DIzeKT-f.js";import{S as e}from"./stack.component-DIHudFdb.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-B3E5oWZI.js";import"./box.component-dwj9v6uv.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};const y=["StackedCards"];export{r as StackedCards,y as __namedExportsOrder,j as default};
