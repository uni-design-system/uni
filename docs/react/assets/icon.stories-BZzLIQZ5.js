import{j as r}from"./jsx-runtime-DPvo8-Rg.js";import{N as d}from"./iframe-CnT1qQIG.js";import{I as s,s as i}from"./slide.component-gQc-19K0.js";import{B as l}from"./button.component-CYu9tA0y.js";import"./card.component-BGYKWjrP.js";import"./sortableList.component-BmxEW0lo.js";import"./icon-text-row.component-CL6C8BcG.js";import"./modal.component-CKRiK3rn.js";import"./switch.component-0IxNhAB4.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-D5Kb78QK.js";import"./index-CrXHHecN.js";import"./overlay.component-DW50c_1A.js";import"./proxy-DUngmXUE.js";import"./background.component-Bw152JbN.js";import"./text.component-BNy5Yykp.js";import"./image.component-C37_nUij.js";import"./shadow.style-B1sALr0o.js";import"./padding.style-k3FT0osq.js";import"./index-CIDUDlRk.js";import"./index-DxEYF88r.js";const B={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
}`,...t.parameters?.docs?.source}}};const L=["IconPlayground","IconManifest"];export{t as IconManifest,o as IconPlayground,L as __namedExportsOrder,B as default};
