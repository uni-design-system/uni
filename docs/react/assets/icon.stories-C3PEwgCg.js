import{j as r}from"./jsx-runtime-DBFP9N8L.js";import{N as d}from"./iframe-C2iUZAq8.js";import{I as s,s as i}from"./slide.component-D-YoHATy.js";import{B as l}from"./button.component-CybH3yiV.js";import"./card.component-DWWNcJ-8.js";import"./sortableList.component-Dxp5PiDz.js";import"./icon-text-row.component-DZUKO2-o.js";import"./box.component-Dd8LtLBY.js";import"./center.component-BWrx86AA.js";import"./grid.component-Do0x4NZP.js";import"./row.component-DtngaZDf.js";import"./stack.component-WOS0Ni0g.js";import"./wrap.component-DmUNXpgd.js";import"./modal.component-retLFhym.js";import"./switch.component-SqmUgA5v.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-CaW4DJLk.js";import"./overlay.component-CL4WiOlV.js";import"./background.component-wYv8Tu6m.js";import"./text.component-BzPSHLNP.js";import"./image.component-DgMols-K.js";import"./shadow.style-gyMEhMHS.js";import"./padding.style-k3FT0osq.js";import"./index-Ds5VAlNQ.js";import"./index-BIrfQVIR.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
