import{j as r}from"./jsx-runtime-DQvXQ3wD.js";import{w as d}from"./iframe-a7DwVIhe.js";import{I as s,s as i}from"./slide.component-BvOFQxEp.js";import{B as l}from"./button.component-BWG9ucXH.js";import"./card.component-DX_pdH4E.js";import"./sortableList.component-DlO5VFoN.js";import"./icon-text-row.component-Zfc-m8gs.js";import"./box.component-DDOhESem.js";import"./center.component-Cn-rS7DB.js";import"./grid.component-BXRujnTl.js";import"./row.component-BVoe6Il-.js";import"./stack.component-BRb4jrv4.js";import"./wrap.component-B8hcimUF.js";import"./modal.component-CExF8mZU.js";import"./switch.component-CTXjwtxq.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-DwVHVd6Y.js";import"./overlay.component-BKtT0fW4.js";import"./background.component-3M16sZy_.js";import"./text.component-CMEkUAvp.js";import"./image.component-CIwWcHhC.js";import"./shadow.style-CdZAfA4F.js";import"./padding.style-k3FT0osq.js";import"./index-D-hNAAOY.js";import"./index-0qXtQEAV.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};const $=["IconPlayground","IconManifest"];o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
