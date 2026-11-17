import{j as e}from"./jsx-runtime-BFQYTiIK.js";import"./background.component-CcNJs86C.js";import{T as a}from"./text.component-DJ-A3fN8.js";import"./slide.component-Bf0_q79Y.js";import"./iframe-6sRvOqMq.js";import"./image.component-BqwmmIFw.js";import"./overlay.component-BZzB5R_1.js";import"./theming-BQAouRa3.js";import{B as n}from"./box.component-GEpUB2wK.js";import{W as s}from"./wrap.component-DX4NK32L.js";import"./preload-helper-PPVm8Dsz.js";const f={title:"Components/Layout/Wrap",component:s,tags:["layout"],parameters:{docs:{description:{component:"Adds space between elements and wraps them onto the next line when there is not enough room. It is a `Box` with wrapping presets."}}}},r={args:{gap:"sm",maxWidth:420,padding:"md",border:"outline",borderRadius:"md"},render:t=>e.jsx(s,{...t,children:["Sofas","Lighting","Rugs","Case goods","Textiles","Art","Accessories"].map(o=>e.jsx(n,{color:"secondary-container",borderRadius:"sm",padding:"sm",children:e.jsx(a,{children:o})},o))})},y=["Primary"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'sm',
    maxWidth: 420,
    padding: 'md',
    border: 'outline',
    borderRadius: 'md'
  },
  render: args => <Wrap {...args}>
      {['Sofas', 'Lighting', 'Rugs', 'Case goods', 'Textiles', 'Art', 'Accessories'].map(tag => <Box key={tag} color="secondary-container" borderRadius="sm" padding="sm">
          <Text>{tag}</Text>
        </Box>)}
    </Wrap>
}`,...r.parameters?.docs?.source}}};export{r as Primary,y as __namedExportsOrder,f as default};
