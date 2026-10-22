import{j as t}from"./jsx-runtime-C7LHGvpA.js";import"./background.component-CXfO8jZG.js";import{T as s}from"./text.component-T-Xyp9jC.js";import"./slide.component-GY4TZbQm.js";import"./iframe-D2jOi4mG.js";import"./image.component-CTAZyRUR.js";import"./overlay.component-B1BUy9hT.js";import"./theming-F6fzZ04O.js";import{C as m}from"./card.component-DSTEYS5D.js";import{S as e}from"./stack.component-7GwDhIvT.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-BkiJr2Ox.js";import"./box.component-BmVQ6rjk.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
