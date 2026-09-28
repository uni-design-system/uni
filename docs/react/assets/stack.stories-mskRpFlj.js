import{j as t}from"./jsx-runtime-MpAbx3W_.js";import"./background.component-APwYJgdg.js";import{T as s}from"./text.component-DT0AbFe4.js";import"./slide.component-BAqu-2JQ.js";import"./iframe-Ci4QqO2J.js";import"./image.component-0tE067WS.js";import"./overlay.component-DfneG-fH.js";import"./theming-DMNm3IKo.js";import{C as m}from"./card.component-B-1A0eS9.js";import{S as e}from"./stack.component-IVL4Tlsu.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-BlKnDdUj.js";import"./box.component-DdUQJV71.js";const j={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})},y=["StackedCards"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};export{r as StackedCards,y as __namedExportsOrder,j as default};
