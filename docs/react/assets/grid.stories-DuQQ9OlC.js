import{j as a}from"./jsx-runtime-C7LHGvpA.js";import"./background.component-CXfO8jZG.js";import{T as i}from"./text.component-T-Xyp9jC.js";import"./slide.component-GY4TZbQm.js";import"./iframe-D2jOi4mG.js";import"./image.component-CTAZyRUR.js";import"./overlay.component-B1BUy9hT.js";import"./theming-F6fzZ04O.js";import{G as o,a as s}from"./grid.component-BAYcvKYV.js";import"./preload-helper-PPVm8Dsz.js";import"./box.component-BmVQ6rjk.js";const w={title:"Components/Layout/Grid",component:o,tags:["layout"],parameters:{docs:{description:{component:"Grid composes elements in a grid-like pattern. Like tables, grids align elements into columns and rows — but they allow far more control when spanning elements across them. Pair it with `GridArea` to place children by name."}}},argTypes:{templateAreas:{description:"Sets `grid-template-areas`."},templateColumns:{description:"Sets `grid-template-columns`."},templateRows:{description:"Sets `grid-template-rows`."},outline:{description:"Draws grid rules by opening the gap to a theme thickness."},outlineColor:{description:"The color those grid rules are drawn in."}}},m=[{area:"nav",color:"tertiary-container"},{area:"a1",color:"primary-container"},{area:"a2",color:"secondary-container"},{area:"b1",color:"tertiary-container"},{area:"b2",color:"error-container"}],r={args:{templateAreas:"'nav a1 a2' 'nav b1 b2'",gap:"sm"},render:t=>a.jsx(o,{...t,children:m.map(({area:e,color:n})=>a.jsx(s,{area:e,color:n,padding:"md",borderRadius:"sm",children:a.jsx(i,{children:e})},e))})},A=["SimpleGrid"];r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
