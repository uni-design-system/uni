import{j as r}from"./jsx-runtime-NolJ_E3e.js";import{w as d}from"./iframe-BwQlGZe3.js";import{I as s,s as i}from"./slide.component-AY22UHDf.js";import{B as l}from"./button.component-BP3sPHA7.js";import"./card.component-DzApXR2Y.js";import"./sortableList.component-xFX2_11c.js";import"./icon-text-row.component-CkExobwu.js";import"./box.component-CllBxmby.js";import"./center.component-kjIOTNpw.js";import"./grid.component-DaCLFy28.js";import"./row.component-CIJTbI1c.js";import"./stack.component-Ce3GPRdj.js";import"./wrap.component-DDhtN1XG.js";import"./modal.component-DGpZEbYf.js";import"./switch.component-D3Wc1zGj.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-BXzFroeb.js";import"./overlay.component-d7kEmflN.js";import"./background.component-B75UeEzC.js";import"./text.component-DdNS3has.js";import"./image.component-B8WQJc9J.js";import"./shadow.style-CvIkHqjg.js";import"./padding.style-k3FT0osq.js";import"./index-DO9YliqE.js";import"./index-De7GMgE7.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};const $=["IconPlayground","IconManifest"];o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
