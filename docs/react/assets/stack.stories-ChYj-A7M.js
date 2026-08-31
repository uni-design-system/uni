import{j as t}from"./jsx-runtime-DBFP9N8L.js";import"./background.component-wYv8Tu6m.js";import{T as s}from"./text.component-BzPSHLNP.js";import"./slide.component-D-YoHATy.js";import"./iframe-C2iUZAq8.js";import"./image.component-DgMols-K.js";import"./overlay.component-CL4WiOlV.js";import"./theming-CaW4DJLk.js";import{C as m}from"./card.component-DWWNcJ-8.js";import{S as e}from"./stack.component-WOS0Ni0g.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-gyMEhMHS.js";import"./box.component-Dd8LtLBY.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};const y=["StackedCards"];export{r as StackedCards,y as __namedExportsOrder,j as default};
