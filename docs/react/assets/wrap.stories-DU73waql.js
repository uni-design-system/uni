import{j as e}from"./jsx-runtime-DBFP9N8L.js";import"./background.component-wYv8Tu6m.js";import{T as a}from"./text.component-BzPSHLNP.js";import"./slide.component-D-YoHATy.js";import"./iframe-C2iUZAq8.js";import"./image.component-DgMols-K.js";import"./overlay.component-CL4WiOlV.js";import"./theming-CaW4DJLk.js";import{B as i}from"./box.component-Dd8LtLBY.js";import{W as s}from"./wrap.component-DmUNXpgd.js";import"./preload-helper-PPVm8Dsz.js";const f={title:"Components/Layout/Wrap",component:s,tags:["layout"],parameters:{docs:{description:{component:"Adds space between elements and wraps them onto the next line when there is not enough room. It is a `Box` with wrapping presets."}}}},r={args:{gap:"sm",maxWidth:420,padding:"md",border:"outline",borderRadius:"md"},render:t=>e.jsx(s,{...t,children:["Sofas","Lighting","Rugs","Case goods","Textiles","Art","Accessories"].map(o=>e.jsx(i,{color:"secondary-container",borderRadius:"sm",padding:"sm",children:e.jsx(a,{children:o})},o))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};const y=["Primary"];export{r as Primary,y as __namedExportsOrder,f as default};
