import{j as t}from"./jsx-runtime-BvhEJYLi.js";import"./background.component-D6l_y3oi.js";import{T as s}from"./text.component-CMVxBHL0.js";import"./slide.component-Db2TecVI.js";import"./iframe-8OV7aG2Q.js";import"./image.component-BCWzQ6Rk.js";import"./overlay.component-C7x2s-_P.js";import"./theming-Uuai6JUO.js";import{C as m}from"./card.component-B3utZeIg.js";import{S as e}from"./stack.component-D3h54IqU.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-DOPqG06D.js";import"./box.component-CpYtQ0K7.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};const y=["StackedCards"];export{r as StackedCards,y as __namedExportsOrder,j as default};
