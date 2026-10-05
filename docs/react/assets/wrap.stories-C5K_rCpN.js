import{j as e}from"./jsx-runtime-CukhQt12.js";import"./background.component-5e2PLe9m.js";import{T as a}from"./text.component-C0UBlx8B.js";import"./slide.component-BXZFDCHk.js";import"./iframe-67pwTFkj.js";import"./image.component-DLb31soY.js";import"./overlay.component-BhcgtJko.js";import"./theming-DNlchhpz.js";import{B as n}from"./box.component-CNVaROlr.js";import{W as s}from"./wrap.component-lywDJDLe.js";import"./preload-helper-PPVm8Dsz.js";const f={title:"Components/Layout/Wrap",component:s,tags:["layout"],parameters:{docs:{description:{component:"Adds space between elements and wraps them onto the next line when there is not enough room. It is a `Box` with wrapping presets."}}}},r={args:{gap:"sm",maxWidth:420,padding:"md",border:"outline",borderRadius:"md"},render:t=>e.jsx(s,{...t,children:["Sofas","Lighting","Rugs","Case goods","Textiles","Art","Accessories"].map(o=>e.jsx(n,{color:"secondary-container",borderRadius:"sm",padding:"sm",children:e.jsx(a,{children:o})},o))})},y=["Primary"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
