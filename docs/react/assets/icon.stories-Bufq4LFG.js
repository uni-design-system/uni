import{j as r}from"./jsx-runtime-IBeB1UcM.js";import{N as d}from"./iframe-DYA2kPFJ.js";import{I as s,s as i}from"./slide.component-XJstm7YO.js";import{B as l}from"./button.component-Cof6LUP5.js";import"./card.component-C1pxOGEK.js";import"./sortableList.component-Cm3IJhve.js";import"./icon-text-row.component-CfVbL10M.js";import"./box.component-DK40blpl.js";import"./center.component-Dxj3NcUF.js";import"./grid.component-DODJr1Jd.js";import"./row.component-BdNLnQ3S.js";import"./stack.component-DraGMgTh.js";import"./wrap.component-D_Bv2-Jv.js";import"./modal.component-CsQxE8gm.js";import"./switch.component-QRZXWVG1.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-BetMyuOf.js";import"./index-Dr6_Mi5O.js";import"./overlay.component-Dug9Njrk.js";import"./proxy-CKhsY_2k.js";import"./background.component-nmf7HTaL.js";import"./text.component-zG4iNt5Q.js";import"./image.component-DCLfloor.js";import"./shadow.style-DJY7M_Ol.js";import"./padding.style-k3FT0osq.js";import"./index-vNlpAA87.js";import"./index-Ca2slgXA.js";const J={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
}`,...t.parameters?.docs?.source}}};const R=["IconPlayground","IconManifest"];export{t as IconManifest,o as IconPlayground,R as __namedExportsOrder,J as default};
