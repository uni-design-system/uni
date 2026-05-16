import{j as r}from"./jsx-runtime-3dEzR1X-.js";import{r as d}from"./iframe-B3qmb9tn.js";import{I as s,s as i}from"./slide.component-rUFD5C3s.js";import{B as l}from"./button.component-CaJpfUjs.js";import"./card.component-DY1f_ENs.js";import"./sortableList.component-DQrTiIbQ.js";import"./icon-text-row.component-D1I-hstL.js";import"./modal.component-DoyVynnN.js";import"./switch.component-XWCxkRPs.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-UgE89kon.js";import"./overlay.component-qOyxPZIv.js";import"./proxy-B0tq3SHr.js";import"./background.component-Bq9vebAK.js";import"./text.component-BIsis_vh.js";import"./image.component-nEi1uikl.js";import"./shadow.style-PiIUYFkb.js";import"./padding.style-k3FT0osq.js";import"./index-SerNmQeC.js";import"./index-CWlhtMNY.js";const q={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
}`,...t.parameters?.docs?.source}}};const B=["IconPlayground","IconManifest"];export{t as IconManifest,o as IconPlayground,B as __namedExportsOrder,q as default};
