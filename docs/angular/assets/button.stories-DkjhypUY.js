import{n as e}from"./chunk-DnJy8xQt.js";import{p as t,s as n,y as r}from"./core-pwuVT70C.js";import{a as i,n as a}from"./common-C498KDiB.js";var o,s=e((()=>{o=`
    button { padding: 12px 24px; border-radius: 4px; border: none; cursor: pointer; }
  `})),c,l,u=e((()=>{s(),n(),a(),c=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},l=class{constructor(){this.label=`Button`,this.bgColor=`#000000`,this.textColor=`#fff`}static{this.propDecorators={label:[{type:r}]}}},l=c([t({selector:`uni-button`,standalone:!0,imports:[i],template:`
    <button [style.background-color]="bgColor" [style.color]="textColor">
      {{ label }}
    </button>
  `,styles:[o]})],l)})),d,f,p;e((()=>{u(),d={title:`Components/UniButton`,component:l,render:e=>({props:e})},f={args:{label:`My Angular Component`}},p=[`Primary`]}))();export{f as Primary,p as __namedExportsOrder,d as default};