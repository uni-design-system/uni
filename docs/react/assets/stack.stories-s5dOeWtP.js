import{j as t}from"./jsx-runtime-DdPf6JEo.js";import"./background.component-jp8oQXgt.js";import{T as s}from"./text.component-UCW9OjFj.js";import"./slide.component-C28-STb2.js";import"./iframe-ehB4VSeF.js";import"./image.component-BAVD5oy2.js";import"./overlay.component-B4wlrGko.js";import"./theming-Bs9CaMQH.js";import{C as m}from"./card.component-CbdfWhFb.js";import{S as e}from"./stack.component-DKVUmRRC.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-BkZfLfiN.js";import"./box.component-BGv7i8gO.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
