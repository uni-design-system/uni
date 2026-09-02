import{j as r}from"./jsx-runtime-BvhEJYLi.js";import{N as d}from"./iframe-8OV7aG2Q.js";import{I as s,s as i}from"./slide.component-Db2TecVI.js";import{B as l}from"./button.component-XSX_J_Jj.js";import"./card.component-B3utZeIg.js";import"./sortableList.component-Dt9sXzXP.js";import"./icon-text-row.component-D1er6yVb.js";import"./box.component-CpYtQ0K7.js";import"./center.component-BBrVeOzV.js";import"./grid.component-C6d7dSF_.js";import"./row.component-VYeXlR0U.js";import"./stack.component-D3h54IqU.js";import"./wrap.component-DBWMpT3i.js";import"./modal.component-Ca9IqrGS.js";import"./switch.component-Bzp_n5Ya.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-Uuai6JUO.js";import"./overlay.component-C7x2s-_P.js";import"./background.component-D6l_y3oi.js";import"./text.component-CMVxBHL0.js";import"./image.component-BCWzQ6Rk.js";import"./shadow.style-DOPqG06D.js";import"./padding.style-k3FT0osq.js";import"./index-C5ANr4pI.js";import"./index-CsJYWonD.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
