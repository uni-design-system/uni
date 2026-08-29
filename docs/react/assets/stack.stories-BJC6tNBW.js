import{j as t}from"./jsx-runtime-DsQornH-.js";import"./background.component-pzQEC69A.js";import{T as s}from"./text.component-IIDedlvq.js";import"./slide.component-DzJX5nEF.js";import"./iframe-BS4xe9JB.js";import"./image.component-D-HF6HTy.js";import"./overlay.component-DW1dJ-tb.js";import"./theming-3TnGoW4m.js";import{C as m}from"./card.component-Di5IYfwc.js";import{S as e}from"./stack.component-YEmj5__R.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-EmlLvU-f.js";import"./box.component-CEL6c41t.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};const y=["StackedCards"];export{r as StackedCards,y as __namedExportsOrder,j as default};
