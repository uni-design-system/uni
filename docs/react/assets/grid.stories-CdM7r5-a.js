import{j as a}from"./jsx-runtime-BmcP-LLi.js";import"./background.component-Xccyhz1u.js";import{T as i}from"./text.component-D3193EcP.js";import"./slide.component-BaXrk8MY.js";import"./iframe-XwEvmobn.js";import"./image.component-DmvAaOlX.js";import"./overlay.component-2RBZ3uSw.js";import"./theming-CiT3o0um.js";import{G as o,a as s}from"./grid.component-8X0DVf_A.js";import"./preload-helper-PPVm8Dsz.js";import"./box.component-Bmg1r5oq.js";const w={title:"Components/Layout/Grid",component:o,tags:["layout"],parameters:{docs:{description:{component:"Grid composes elements in a grid-like pattern. Like tables, grids align elements into columns and rows — but they allow far more control when spanning elements across them. Pair it with `GridArea` to place children by name."}}},argTypes:{templateAreas:{description:"Sets `grid-template-areas`."},templateColumns:{description:"Sets `grid-template-columns`."},templateRows:{description:"Sets `grid-template-rows`."},outline:{description:"Draws grid rules by opening the gap to a theme thickness."},outlineColor:{description:"The color those grid rules are drawn in."}}},m=[{area:"nav",color:"tertiary-container"},{area:"a1",color:"primary-container"},{area:"a2",color:"secondary-container"},{area:"b1",color:"tertiary-container"},{area:"b2",color:"error-container"}],r={args:{templateAreas:"'nav a1 a2' 'nav b1 b2'",gap:"sm"},render:t=>a.jsx(o,{...t,children:m.map(({area:e,color:n})=>a.jsx(s,{area:e,color:n,padding:"md",borderRadius:"sm",children:a.jsx(i,{children:e})},e))})},A=["SimpleGrid"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    templateAreas: \`'nav a1 a2' 'nav b1 b2'\`,
    gap: 'sm'
  },
  render: args => <Grid {...args}>
      {cells.map(({
      area,
      color
    }) => <GridArea key={area} area={area} color={color} padding="md" borderRadius="sm">
          <Text>{area}</Text>
        </GridArea>)}
    </Grid>
}`,...r.parameters?.docs?.source}}};export{r as SimpleGrid,A as __namedExportsOrder,w as default};
