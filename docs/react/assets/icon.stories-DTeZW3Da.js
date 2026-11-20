import{j as r}from"./jsx-runtime-ktpdT-Ni.js";import{w as d}from"./iframe-DPh57Xk7.js";import{I as s,s as i}from"./slide.component-DRg0-uMY.js";import{B as l}from"./button.component-Be0rvTtW.js";import"./card.component-CP4gd3Ok.js";import"./sortableList.component-LVwJ1rUv.js";import"./icon-text-row.component-x-1a0fhG.js";import"./box.component-D4AFqQU4.js";import"./center.component-C43ycbSa.js";import"./grid.component-C9bYQ05Z.js";import"./row.component-D8BzyJfR.js";import"./stack.component-CBjqZ8Ew.js";import"./wrap.component-DJDAlpsB.js";import"./modal.component-D5Uo6Pmu.js";import"./switch.component-CZOBOdvn.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-BU0Q0uo_.js";import"./overlay.component-BkStBB1a.js";import"./background.component-DK0i26CA.js";import"./text.component-aSWmE1Xz.js";import"./image.component-D-tP1rxK.js";import"./shadow.style-Dri9NagB.js";import"./padding.style-k3FT0osq.js";import"./index-CR96Ke8Z.js";import"./index-B8G46_wD.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};const $=["IconPlayground","IconManifest"];o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
