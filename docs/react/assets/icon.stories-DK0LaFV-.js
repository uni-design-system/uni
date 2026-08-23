import{j as r}from"./jsx-runtime-Oa7rHVvf.js";import{N as d}from"./iframe-DckPpy46.js";import{I as s,s as i}from"./slide.component-2tgY2dEw.js";import{B as l}from"./button.component-BlMhNrMW.js";import"./card.component-DIzeKT-f.js";import"./sortableList.component-DNEENzox.js";import"./icon-text-row.component-BSqKx6PD.js";import"./box.component-dwj9v6uv.js";import"./center.component-B1u2BMuV.js";import"./grid.component-BMbckude.js";import"./row.component-DxoGJZ9X.js";import"./stack.component-DIHudFdb.js";import"./wrap.component-o9sR-8v4.js";import"./modal.component-b1DXe6PJ.js";import"./switch.component-BdhQ6tqz.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-C32jxOEN.js";import"./overlay.component-CKD_QmFw.js";import"./background.component-DvgdtKes.js";import"./text.component-BguqKKj9.js";import"./image.component-BBbVvA4O.js";import"./shadow.style-B3E5oWZI.js";import"./padding.style-k3FT0osq.js";import"./index-Oi5Vy-Os.js";import"./index-3goIjy8F.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
