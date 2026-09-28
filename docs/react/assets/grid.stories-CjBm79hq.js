import{j as a}from"./jsx-runtime-MpAbx3W_.js";import"./background.component-APwYJgdg.js";import{T as i}from"./text.component-DT0AbFe4.js";import"./slide.component-BAqu-2JQ.js";import"./iframe-Ci4QqO2J.js";import"./image.component-0tE067WS.js";import"./overlay.component-DfneG-fH.js";import"./theming-DMNm3IKo.js";import{G as o,a as s}from"./grid.component-CqZXpAQ5.js";import"./preload-helper-PPVm8Dsz.js";import"./box.component-DdUQJV71.js";const w={title:"Components/Layout/Grid",component:o,tags:["layout"],parameters:{docs:{description:{component:"Grid composes elements in a grid-like pattern. Like tables, grids align elements into columns and rows — but they allow far more control when spanning elements across them. Pair it with `GridArea` to place children by name."}}},argTypes:{templateAreas:{description:"Sets `grid-template-areas`."},templateColumns:{description:"Sets `grid-template-columns`."},templateRows:{description:"Sets `grid-template-rows`."},outline:{description:"Draws grid rules by opening the gap to a theme thickness."},outlineColor:{description:"The color those grid rules are drawn in."}}},m=[{area:"nav",color:"tertiary-container"},{area:"a1",color:"primary-container"},{area:"a2",color:"secondary-container"},{area:"b1",color:"tertiary-container"},{area:"b2",color:"error-container"}],r={args:{templateAreas:"'nav a1 a2' 'nav b1 b2'",gap:"sm"},render:t=>a.jsx(o,{...t,children:m.map(({area:e,color:n})=>a.jsx(s,{area:e,color:n,padding:"md",borderRadius:"sm",children:a.jsx(i,{children:e})},e))})},A=["SimpleGrid"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
