import{j as r}from"./jsx-runtime-BHFZ1sx6.js";import{N as d}from"./iframe-4Wq16SO7.js";import{I as s,s as i}from"./slide.component-gLxejfuT.js";import{B as l}from"./button.component-Bx3788fn.js";import"./card.component-RAXxqT-5.js";import"./sortableList.component-_w4lTm5F.js";import"./icon-text-row.component-BD-2v9cD.js";import"./modal.component-CXqXJwEQ.js";import"./switch.component--_QYvEyv.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-BpMXswuL.js";import"./index-CuQ6qPI-.js";import"./overlay.component-BnV6gSSi.js";import"./proxy-Bj1fZ6eo.js";import"./background.component-GTh57Mbh.js";import"./text.component-Dz1inoDY.js";import"./image.component-z-8l-dhO.js";import"./shadow.style-CWGBiGa0.js";import"./padding.style-k3FT0osq.js";import"./index-BNDD1UD7.js";import"./index-Ha36w7N5.js";const B={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
