import{j as r}from"./jsx-runtime-MpAbx3W_.js";import{w as d}from"./iframe-Ci4QqO2J.js";import{I as s,s as i}from"./slide.component-BAqu-2JQ.js";import{B as l}from"./button.component-Cx_5EeFU.js";import"./card.component-B-1A0eS9.js";import"./sortableList.component-kNmOz6kK.js";import"./icon-text-row.component-CeXYmd0v.js";import"./box.component-DdUQJV71.js";import"./center.component-aSK4vHml.js";import"./grid.component-CqZXpAQ5.js";import"./row.component-Dnh77B33.js";import"./stack.component-IVL4Tlsu.js";import"./wrap.component-5BhVw47k.js";import"./modal.component-BBAK8sNv.js";import"./switch.component-BkNQOZj6.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-DMNm3IKo.js";import"./overlay.component-DfneG-fH.js";import"./background.component-APwYJgdg.js";import"./text.component-DT0AbFe4.js";import"./image.component-0tE067WS.js";import"./shadow.style-BlKnDdUj.js";import"./padding.style-k3FT0osq.js";import"./index-BLBVnYAZ.js";import"./index-BaEpJmCr.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};const $=["IconPlayground","IconManifest"];o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
