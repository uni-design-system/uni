import{j as e}from"./jsx-runtime-DQvXQ3wD.js";import"./background.component-3M16sZy_.js";import{T as a}from"./text.component-CMEkUAvp.js";import"./slide.component-BvOFQxEp.js";import"./iframe-a7DwVIhe.js";import"./image.component-CIwWcHhC.js";import"./overlay.component-BKtT0fW4.js";import"./theming-DwVHVd6Y.js";import{B as n}from"./box.component-DDOhESem.js";import{W as s}from"./wrap.component-B8hcimUF.js";import"./preload-helper-PPVm8Dsz.js";const f={title:"Components/Layout/Wrap",component:s,tags:["layout"],parameters:{docs:{description:{component:"Adds space between elements and wraps them onto the next line when there is not enough room. It is a `Box` with wrapping presets."}}}},r={args:{gap:"sm",maxWidth:420,padding:"md",border:"outline",borderRadius:"md"},render:t=>e.jsx(s,{...t,children:["Sofas","Lighting","Rugs","Case goods","Textiles","Art","Accessories"].map(o=>e.jsx(n,{color:"secondary-container",borderRadius:"sm",padding:"sm",children:e.jsx(a,{children:o})},o))})},y=["Primary"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
