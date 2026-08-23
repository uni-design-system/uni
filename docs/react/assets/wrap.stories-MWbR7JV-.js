import{j as e}from"./jsx-runtime-IBeB1UcM.js";import"./background.component-nmf7HTaL.js";import{T as a}from"./text.component-zG4iNt5Q.js";import"./slide.component-XJstm7YO.js";import"./iframe-DYA2kPFJ.js";import"./image.component-DCLfloor.js";import"./overlay.component-Dug9Njrk.js";import"./theming-BetMyuOf.js";import{B as i}from"./box.component-DK40blpl.js";import{W as s}from"./wrap.component-D_Bv2-Jv.js";import"./index-Dr6_Mi5O.js";import"./proxy-CKhsY_2k.js";import"./preload-helper-PPVm8Dsz.js";const R={title:"Components/Layout/Wrap",component:s,tags:["layout"],parameters:{docs:{description:{component:"Adds space between elements and wraps them onto the next line when there is not enough room. It is a `Box` with wrapping presets."}}}},r={args:{gap:"sm",maxWidth:420,padding:"md",border:"outline",borderRadius:"md"},render:t=>e.jsx(s,{...t,children:["Sofas","Lighting","Rugs","Case goods","Textiles","Art","Accessories"].map(o=>e.jsx(i,{color:"secondary-container",borderRadius:"sm",padding:"sm",children:e.jsx(a,{children:o})},o))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};const W=["Primary"];export{r as Primary,W as __namedExportsOrder,R as default};
