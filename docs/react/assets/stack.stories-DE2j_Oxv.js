import{j as t}from"./jsx-runtime-IBeB1UcM.js";import"./background.component-nmf7HTaL.js";import{T as s}from"./text.component-zG4iNt5Q.js";import"./slide.component-XJstm7YO.js";import"./iframe-DYA2kPFJ.js";import"./image.component-DCLfloor.js";import"./overlay.component-Dug9Njrk.js";import"./theming-BetMyuOf.js";import{C as m}from"./card.component-C1pxOGEK.js";import{S as e}from"./stack.component-DraGMgTh.js";import"./index-Dr6_Mi5O.js";import"./proxy-CKhsY_2k.js";import"./preload-helper-PPVm8Dsz.js";import"./padding.style-k3FT0osq.js";import"./shadow.style-DJY7M_Ol.js";import"./box.component-DK40blpl.js";const T={title:"Components/Layout/Stack",component:e,tags:["layout"],parameters:{docs:{description:{component:"`Stack` groups elements in a vertical arrangement with a uniform space between them. It is a `Box` with column presets, so every `Box` prop is available to it."}}}},r={args:{gap:"lg"},render:o=>t.jsx(e,{...o,children:[1,2,3,4,5].map(a=>t.jsx(m,{children:t.jsxs(s,{children:["Card ",a]})},a))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'lg'
  },
  render: args => <Stack {...args}>
      {[1, 2, 3, 4, 5].map(n => <Card key={n}>
          <Text>Card {n}</Text>
        </Card>)}
    </Stack>
}`,...r.parameters?.docs?.source}}};const v=["StackedCards"];export{r as StackedCards,v as __namedExportsOrder,T as default};
