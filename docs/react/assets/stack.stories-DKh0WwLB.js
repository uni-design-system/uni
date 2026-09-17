import{j as t}from"./jsx-runtime-DQvXQ3wD.js";import"./background.component-3M16sZy_.js";import{T as s}from"./text.component-CMEkUAvp.js";import"./slide.component-BvOFQxEp.js";import"./iframe-a7DwVIhe.js";import"./image.component-CIwWcHhC.js";import"./overlay.component-BKtT0fW4.js";import"./theming-DwVHVd6Y.js";import{C as m}from"./card.component-DX_pdH4E.js";import{S as e}from"./stack.component-BRb4jrv4.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-CdZAfA4F.js";import"./box.component-DDOhESem.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
