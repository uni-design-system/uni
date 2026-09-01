import{j as e}from"./jsx-runtime-D6Wft5m6.js";import"./background.component-D6ZnonYq.js";import{T as r}from"./text.component-CUr_VyBM.js";import"./slide.component-BwwRpVfu.js";import"./iframe-BfYA7p1B.js";import"./image.component-CcJi1Wa3.js";import"./overlay.component-C7p3G0b_.js";import"./theming-BI4W5mQX.js";import{B as s}from"./box.component-Du68-QCp.js";import"./preload-helper-PPVm8Dsz.js";const f={title:"Components/Layout/Box",component:s,tags:["layout"],parameters:{docs:{description:{component:'Box is the base layout component. It is highly configurable, and every other layout component is a Box with presets. Render it as any element with `as` so the semantics stay yours: `<Box as="main" padding="md">`.'}}},render:({children:n,...d})=>e.jsx(s,{...d,children:e.jsx(r,{children:n})}),argTypes:{color:{description:"Sets the background color of the box using the theme's color tokens."},shadow:{description:"Applies a box shadow based on the theme's elevation levels.",control:{type:"select"},options:["raised","menu","dialog","warn"]},elevation:{description:"Deprecated alias for `shadow`.",control:{type:"select"},options:["raised","menu","dialog","warn"]},textAlign:{description:"Controls the text alignment within the box."},height:{description:"Sets the height of the box. A number is pixels; a string is a CSS length ('100%')."},minHeight:{description:"Sets the minimum height of the box."},maxHeight:{description:"Sets the maximum height of the box."},width:{description:"Sets the width of the box. A number is pixels; a string is a CSS length ('100%')."},minWidth:{description:"Sets the minimum width of the box."},maxWidth:{description:"Sets the maximum width of the box."},fullWidth:{description:"When true, sets the width to 100%."},fullHeight:{description:"When true, sets the height to 100%."},padding:{description:"Sets padding on all sides of the box."},paddingHorizontal:{description:"Sets padding on the left and right sides."},paddingVertical:{description:"Sets padding on the top and bottom sides."},paddingLeft:{description:"Sets padding on the left side."},paddingRight:{description:"Sets padding on the right side."},paddingTop:{description:"Sets padding on the top side."},paddingBottom:{description:"Sets padding on the bottom side."},border:{description:"Applies a theme-defined border on all sides."},dashBorder:{description:"When true, applies a dashed border style."},borderTop:{description:"Applies a theme-defined border to the top side."},borderBottom:{description:"Applies a theme-defined border to the bottom side."},borderLeft:{description:"Applies a theme-defined border to the left side."},borderRight:{description:"Applies a theme-defined border to the right side."},borderRadius:{description:"Sets the border radius on all corners."},borderRadiusLeft:{description:"Sets the border radius on the left corners."},borderRadiusRight:{description:"Sets the border radius on the right corners."},borderRadiusTop:{description:"Sets the border radius on the top corners."},borderRadiusBottom:{description:"Sets the border radius on the bottom corners."},display:{description:"Sets the display property (flex, block, etc.)."},flexDirection:{description:"Sets the direction of flex items."},alignSelf:{description:"Controls how the box aligns itself within its container."},alignItems:{description:"Controls how items are aligned within the box."},alignContent:{description:"Controls alignment of lines when there's extra space in the cross-axis."},justifyContent:{description:"Controls alignment of items along the main axis."},grow:{description:"Sets the flex grow factor, determining how much the box will grow relative to other flex items."},wrapItems:{description:"Controls whether flex items wrap onto multiple lines."},gap:{description:"Sets the gap between flex or grid items."},gridArea:{description:"Specifies the grid area the box should occupy."},gridColumn:{description:"Specifies which column(s) the box should occupy."},gridRow:{description:"Specifies which row(s) the box should occupy."},as:{description:"The element to render. Defaults to `div`."},overflow:{description:"Controls how content that overflows the box is handled."},ignoreDir:{description:"When true (default), automatically reverses flex direction in RTL mode."}}},o={args:{color:"secondary-container",borderRadius:"md",padding:"lg",children:"Box Content."}},t={args:{display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:"md",padding:"md",border:"outline",borderRadius:"md"},render:n=>e.jsxs(s,{...n,children:[e.jsx(r,{children:"Item 1"}),e.jsx(r,{children:"Item 2"}),e.jsx(r,{children:"Item 3"})]})},i={args:{as:"main",color:"tertiary-container",padding:"lg",borderRadius:"lg",children:"Rendered as <main>."}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    color: 'secondary-container',
    borderRadius: 'md',
    padding: 'lg',
    children: 'Box Content.'
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'md',
    padding: 'md',
    border: 'outline',
    borderRadius: 'md'
  },
  render: args => <Box {...args}>
      <Text>Item 1</Text>
      <Text>Item 2</Text>
      <Text>Item 3</Text>
    </Box>
}`,...t.parameters?.docs?.source},description:{story:"A flex container: three items spread along the main axis.",...t.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    as: 'main',
    color: 'tertiary-container',
    padding: 'lg',
    borderRadius: 'lg',
    children: 'Rendered as <main>.'
  }
}`,...i.parameters?.docs?.source},description:{story:"`as` keeps the semantics yours — this one renders a `<main>` element.",...i.parameters?.docs?.description}}};const w=["Primary","FlexContainer","SemanticElement"];export{t as FlexContainer,o as Primary,i as SemanticElement,w as __namedExportsOrder,f as default};
