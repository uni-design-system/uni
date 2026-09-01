import{j as r}from"./jsx-runtime-D6Wft5m6.js";import{N as d}from"./iframe-BfYA7p1B.js";import{I as s,s as i}from"./slide.component-BwwRpVfu.js";import{B as l}from"./button.component-Dm6WH-Ol.js";import"./card.component-Bv7QmYYh.js";import"./sortableList.component-DIlFFUY-.js";import"./icon-text-row.component-DmUuw-L0.js";import"./box.component-Du68-QCp.js";import"./center.component-DfbTFItI.js";import"./grid.component-62NBQy3T.js";import"./row.component-Dxxf-xxX.js";import"./stack.component-CC4yZmM2.js";import"./wrap.component-QP1OxIFk.js";import"./modal.component-BQPO7k-5.js";import"./switch.component-D58WnlQw.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-BI4W5mQX.js";import"./overlay.component-C7p3G0b_.js";import"./background.component-D6ZnonYq.js";import"./text.component-CUr_VyBM.js";import"./image.component-CcJi1Wa3.js";import"./shadow.style-CXXonaii.js";import"./padding.style-k3FT0osq.js";import"./index-wkuWMKLX.js";import"./index-DRH6v9Ri.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
}`,...t.parameters?.docs?.source}}};const $=["IconPlayground","IconManifest"];export{t as IconManifest,o as IconPlayground,$ as __namedExportsOrder,O as default};
