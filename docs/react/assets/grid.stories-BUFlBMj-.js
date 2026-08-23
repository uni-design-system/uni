import{j as a}from"./jsx-runtime-IBeB1UcM.js";import"./background.component-nmf7HTaL.js";import{T as s}from"./text.component-zG4iNt5Q.js";import"./slide.component-XJstm7YO.js";import"./iframe-DYA2kPFJ.js";import"./image.component-DCLfloor.js";import"./overlay.component-Dug9Njrk.js";import"./theming-BetMyuOf.js";import{G as o,a as n}from"./grid.component-DODJr1Jd.js";import"./index-Dr6_Mi5O.js";import"./proxy-CKhsY_2k.js";import"./preload-helper-PPVm8Dsz.js";import"./box.component-DK40blpl.js";const S={title:"Components/Layout/Grid",component:o,tags:["layout"],parameters:{docs:{description:{component:"Grid composes elements in a grid-like pattern. Like tables, grids align elements into columns and rows — but they allow far more control when spanning elements across them. Pair it with `GridArea` to place children by name."}}},argTypes:{templateAreas:{description:"Sets `grid-template-areas`."},templateColumns:{description:"Sets `grid-template-columns`."},templateRows:{description:"Sets `grid-template-rows`."},outline:{description:"Draws grid rules by opening the gap to a theme thickness."},outlineColor:{description:"The color those grid rules are drawn in."}}},m=[{area:"nav",color:"tertiary-container"},{area:"a1",color:"primary-container"},{area:"a2",color:"secondary-container"},{area:"b1",color:"tertiary-container"},{area:"b2",color:"error-container"}],r={args:{templateAreas:"'nav a1 a2' 'nav b1 b2'",gap:"sm"},render:t=>a.jsx(o,{...t,children:m.map(({area:e,color:i})=>a.jsx(n,{area:e,color:i,padding:"md",borderRadius:"sm",children:a.jsx(s,{children:e})},e))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};const T=["SimpleGrid"];export{r as SimpleGrid,T as __namedExportsOrder,S as default};
