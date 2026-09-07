import{j as r}from"./jsx-runtime-BmcP-LLi.js";import{w as d}from"./iframe-XwEvmobn.js";import{I as s,s as i}from"./slide.component-BaXrk8MY.js";import{B as l}from"./button.component-BsZV_5zD.js";import"./card.component-hy5F1vmb.js";import"./sortableList.component-3YHujy8a.js";import"./icon-text-row.component-CjVNrT3P.js";import"./box.component-Bmg1r5oq.js";import"./center.component-CckfmL6H.js";import"./grid.component-8X0DVf_A.js";import"./row.component-DFoEH0PS.js";import"./stack.component-CsySWHpL.js";import"./wrap.component-XTJpG377.js";import"./modal.component-7kWjNChZ.js";import"./switch.component-CfxNdutu.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-CiT3o0um.js";import"./overlay.component-2RBZ3uSw.js";import"./background.component-Xccyhz1u.js";import"./text.component-D3193EcP.js";import"./image.component-DmvAaOlX.js";import"./shadow.style-CKdrmIqC.js";import"./padding.style-k3FT0osq.js";import"./index-DK1h8MO1.js";import"./index-4MXvAqZ8.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};const $=["IconPlayground","IconManifest"];o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
