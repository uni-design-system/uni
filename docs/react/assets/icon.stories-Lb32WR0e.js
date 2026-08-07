import{j as r}from"./jsx-runtime-DgDUpnmO.js";import{N as d}from"./iframe-B3mQRd26.js";import{I as s,s as i}from"./slide.component-Cs5r329Z.js";import{B as l}from"./button.component-D0yNCS4x.js";import"./card.component-y09luFUt.js";import"./sortableList.component-PSuWEdhs.js";import"./icon-text-row.component-DgYc5iiz.js";import"./modal.component-DkjwAoE8.js";import"./switch.component-CBbgbTfY.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-RSkM6Ogd.js";import"./index-CbmVirQz.js";import"./overlay.component-lwC4LyB8.js";import"./proxy-CKrwgcoL.js";import"./background.component-cYG-_MLk.js";import"./text.component-BItEztWr.js";import"./image.component-C5Ye0U-K.js";import"./shadow.style-DgkxUK76.js";import"./padding.style-k3FT0osq.js";import"./index-BxPhez1S.js";import"./index-q4Z978Ss.js";const B={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
