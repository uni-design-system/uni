import{j as r}from"./jsx-runtime-DV-RmNQI.js";import{w as d}from"./iframe-CC0P-zhe.js";import{I as s,s as i}from"./slide.component-BE4SbJ4_.js";import{B as l}from"./button.component-DIBOrnSU.js";import"./card.component-C8SXTFxT.js";import"./sortableList.component-DGAzjqII.js";import"./icon-text-row.component-DTCrrjnx.js";import"./box.component-B2q5Xul6.js";import"./center.component-DZUz7Se-.js";import"./grid.component-BqdLGv2F.js";import"./row.component-yJcLt-4X.js";import"./stack.component-CI9McwMq.js";import"./wrap.component-DDT9hVL8.js";import"./modal.component-Bk0TPHiL.js";import"./switch.component-BXpV9IZU.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-GLcDMLDc.js";import"./overlay.component-D2b4vynt.js";import"./background.component-iX0EHOp4.js";import"./text.component-CbNEv42a.js";import"./image.component-DwDaSYkE.js";import"./shadow.style-B6AyMqmT.js";import"./padding.style-k3FT0osq.js";import"./index-BCxH9HBd.js";import"./index-Czcf1V2s.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};const $=["IconPlayground","IconManifest"];o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
}`,...t.parameters?.docs?.source}}};export{t as IconManifest,o as IconPlayground,$ as __namedExportsOrder,O as default};
