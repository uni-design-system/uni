import{j as a}from"./jsx-runtime-D6Wft5m6.js";import"./background.component-D6ZnonYq.js";import{T as s}from"./text.component-CUr_VyBM.js";import"./slide.component-BwwRpVfu.js";import"./iframe-BfYA7p1B.js";import"./image.component-CcJi1Wa3.js";import"./overlay.component-C7p3G0b_.js";import"./theming-BI4W5mQX.js";import{G as o,a as n}from"./grid.component-62NBQy3T.js";import"./preload-helper-PPVm8Dsz.js";import"./box.component-Du68-QCp.js";const w={title:"Components/Layout/Grid",component:o,tags:["layout"],parameters:{docs:{description:{component:"Grid composes elements in a grid-like pattern. Like tables, grids align elements into columns and rows — but they allow far more control when spanning elements across them. Pair it with `GridArea` to place children by name."}}},argTypes:{templateAreas:{description:"Sets `grid-template-areas`."},templateColumns:{description:"Sets `grid-template-columns`."},templateRows:{description:"Sets `grid-template-rows`."},outline:{description:"Draws grid rules by opening the gap to a theme thickness."},outlineColor:{description:"The color those grid rules are drawn in."}}},m=[{area:"nav",color:"tertiary-container"},{area:"a1",color:"primary-container"},{area:"a2",color:"secondary-container"},{area:"b1",color:"tertiary-container"},{area:"b2",color:"error-container"}],r={args:{templateAreas:"'nav a1 a2' 'nav b1 b2'",gap:"sm"},render:t=>a.jsx(o,{...t,children:m.map(({area:e,color:i})=>a.jsx(n,{area:e,color:i,padding:"md",borderRadius:"sm",children:a.jsx(s,{children:e})},e))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};const A=["SimpleGrid"];export{r as SimpleGrid,A as __namedExportsOrder,w as default};
