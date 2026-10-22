import{j as r}from"./jsx-runtime-DdPf6JEo.js";import{w as d}from"./iframe-ehB4VSeF.js";import{I as s,s as i}from"./slide.component-C28-STb2.js";import{B as l}from"./button.component-DTeZ6jpZ.js";import"./card.component-CbdfWhFb.js";import"./sortableList.component-BCcvbFWH.js";import"./icon-text-row.component-BfWUScvK.js";import"./box.component-BGv7i8gO.js";import"./center.component-Yk4oJWUW.js";import"./grid.component-DXByaXl1.js";import"./row.component-3HYSlKBk.js";import"./stack.component-DKVUmRRC.js";import"./wrap.component-CaB0kxcM.js";import"./modal.component-DIb94o8T.js";import"./switch.component-QdARukwU.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-Bs9CaMQH.js";import"./overlay.component-B4wlrGko.js";import"./background.component-jp8oQXgt.js";import"./text.component-UCW9OjFj.js";import"./image.component-BAVD5oy2.js";import"./shadow.style-BkZfLfiN.js";import"./padding.style-k3FT0osq.js";import"./index-C03rU0VI.js";import"./index-CPXZk2Je.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};const $=["IconPlayground","IconManifest"];o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
