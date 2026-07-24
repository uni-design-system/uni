import{j as r}from"./jsx-runtime-A96xEf6C.js";import{I as a}from"./image.component-7MAqcggn.js";import"./iframe-CR94n1Bn.js";import"./preload-helper-PPVm8Dsz.js";const n={blur:{control:{type:"range",min:0,max:100,step:1},table:{type:{summary:"number"},defaultValue:{summary:"0"}},description:`Applies a blur effect to the image. A larger value will create more blur.

If no value is specified, 0 is used.`},brightness:{control:{type:"range",min:0,max:100,step:1},table:{type:{summary:"number"},defaultValue:{summary:"0"}},description:`Adjusts the brightness of the image.

0% will make the image completely black.
100% (1) is default and represents the original image.
Values over 100% will provide brighter results.`},contrast:{control:{type:"range",min:0,max:100,step:1},table:{type:{summary:"number"},defaultValue:{summary:"0"}},description:`Adjusts the contrast of the image.

0% will make the image completely black.
100% (1) is default, and represents the original image.
Values over 100% will provide results with more contrast.`},grayscale:{control:{type:"range",min:0,max:100,step:1},table:{type:{summary:"number"},defaultValue:{summary:"0"}},description:`Converts the image to grayscale.

0% (0) is default and represents the original image.
100% will make the image completely gray (used for black and white images).`},"hue-rotate":{control:{type:"range",min:0,max:360,step:1},table:{type:{summary:"number"},defaultValue:{summary:"0"}},description:"Applies a hue rotation on the image. The value defines the number of degrees around the color circle the image samples will be adjusted. 0deg is default, and represents the original image."},invert:{control:{type:"range",min:0,max:100,step:1},table:{type:{summary:"number"},defaultValue:{summary:"0"}},description:`Inverts the samples in the image.

0% (0) is default and represents the original image.
100% will make the image completely inverted.`},opacity:{control:{type:"range",min:0,max:1,step:.01},table:{type:{summary:"number"},defaultValue:{summary:"1"}},description:`Sets the opacity level for the image. The opacity-level describes the transparency-level, where:

0% is completely transparent.
100% (1) is default and represents the original image (no transparency).`},saturate:{control:{type:"range",min:0,max:100,step:1},table:{type:{summary:"number"},defaultValue:{summary:"0"}},description:`Saturates the image.

0% (0) will make the image completely un-saturated.
100% is default and represents the original image.
Values over 100% provides super-saturated results.`},sepia:{control:{type:"range",min:0,max:100,step:1},table:{type:{summary:"number"},defaultValue:{summary:"0"}},description:`Converts the image to sepia.

0% (0) is default and represents the original image.
100% will make the image completely sepia.`}},s={url:{control:{type:"text"},table:{summary:"string"}},fit:{options:["contain","cover","fill","none","scale-down"],control:{type:"inline-radio"},table:{type:{summary:"string literal"},defaultValue:{summary:"cover"}}},height:{control:{type:"number"}},width:{control:{type:"number"}},...n},p={title:"Core/Image",component:a,argTypes:{...s},parameters:{layout:"fullscreen"}},e=t=>r.jsx(a,{...t}),i={fit:"contain",url:"https://www.rollingstone.com/wp-content/uploads/2018/06/rs-108784-e569415749457a65514cfe8b509d7ead8b7b4013.jpg?w=500"};e.args=i;e.__docgenInfo={description:"",methods:[],displayName:"ImagePlayground",props:{blur:{required:!1,tsType:{name:"number"},description:""},brightness:{required:!1,tsType:{name:"number"},description:""},contrast:{required:!1,tsType:{name:"number"},description:""},grayscale:{required:!1,tsType:{name:"number"},description:""},"hue-rotate":{required:!1,tsType:{name:"number"},description:""},invert:{required:!1,tsType:{name:"number"},description:""},opacity:{required:!1,tsType:{name:"number"},description:""},saturate:{required:!1,tsType:{name:"number"},description:""},sepia:{required:!1,tsType:{name:"number"},description:""},url:{required:!1,tsType:{name:"union",raw:"string | undefined",elements:[{name:"string"},{name:"undefined"}]},description:""},alt:{required:!1,tsType:{name:"string"},description:""},fit:{required:!1,tsType:{name:"union",raw:"'contain' | 'cover' | 'fill' | 'none' | 'scale-down'",elements:[{name:"literal",value:"'contain'"},{name:"literal",value:"'cover'"},{name:"literal",value:"'fill'"},{name:"literal",value:"'none'"},{name:"literal",value:"'scale-down'"}]},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"(args: ImageProps) => <Image {...args} />",...e.parameters?.docs?.source}}};const d=["ImagePlayground"];export{e as ImagePlayground,d as __namedExportsOrder,p as default};
