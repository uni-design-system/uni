import{j as r}from"./jsx-runtime-B8a3h9MQ.js";import{N as d}from"./iframe-C8RG7Hve.js";import{I as s,s as i}from"./slide.component-Dk975lWa.js";import{B as l}from"./button.component-CHJdW1u0.js";import"./card.component-BZqjSxPY.js";import"./sortableList.component-Dnv6Hg7M.js";import"./icon-text-row.component-DGaDRF95.js";import"./box.component-DKyZbO7A.js";import"./center.component-Ct7tFGAT.js";import"./grid.component-DrT6oIh4.js";import"./row.component-XXYTXgyi.js";import"./stack.component-Kr9nZYeB.js";import"./wrap.component-DpTPxJsX.js";import"./modal.component-DsKwz0XC.js";import"./switch.component-B-JmtQnh.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-BqerdPHD.js";import"./overlay.component-CAlXZVQ8.js";import"./background.component-DwMxEcAR.js";import"./text.component-DMrqRnr_.js";import"./image.component-CbND1mri.js";import"./shadow.style-DQpi6VRK.js";import"./padding.style-k3FT0osq.js";import"./index-B3Zc65Go.js";import"./index-DoIRu3Y6.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
  const [filteredIcons, setFilteredIcons] = useState<string[]>(IconKeys);
  const Filter = (filter: string): string[] => {
    return IconKeys.filter((name: string) => name.toLowerCase().indexOf(filter.toLowerCase()) > -1);
  };
  const copyToClipboard = async (iconName: string): Promise<void> => {
    await navigator.clipboard.writeText(iconName);
    alert(\`Copied \${iconName} to clipboard.\`);
  };
  return <div>
      <input onChange={(e): void => setFilteredIcons(Filter(e.target.value))} placeholder="Filter Icons by Name" />
      <div>
        {filteredIcons.map(iconName => {
        return <Button buttonType="icon" iconName={iconName as IconName} onClick={(): Promise<void> => copyToClipboard(iconName)}>
              {iconName}
            </Button>;
      })}
      </div>
    </div>;
}`,...t.parameters?.docs?.source}}};const $=["IconPlayground","IconManifest"];export{t as IconManifest,o as IconPlayground,$ as __namedExportsOrder,O as default};
