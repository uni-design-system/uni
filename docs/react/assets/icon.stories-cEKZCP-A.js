import{j as r}from"./jsx-runtime-Qy9fsbJ6.js";import{N as d}from"./iframe-DVTIosnX.js";import{I as s,s as i}from"./slide.component-_8OW1SAD.js";import{B as l}from"./button.component-DJET7vqW.js";import"./card.component-0Y0u-dv1.js";import"./sortableList.component-BEf6r8H-.js";import"./icon-text-row.component-k6XhoZPx.js";import"./modal.component-Cyxm8i5-.js";import"./switch.component-DNUgdoZO.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-DHQISfoX.js";import"./index-D64_9cwO.js";import"./overlay.component-C6HPQHNg.js";import"./proxy-CGuk-RPI.js";import"./background.component-DMbCkDeu.js";import"./text.component-DyqETI0N.js";import"./image.component-C0csa74B.js";import"./shadow.style-CfQ0evXF.js";import"./padding.style-k3FT0osq.js";import"./index-ZF3ULbtm.js";import"./index-CxsiyNKp.js";const B={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
