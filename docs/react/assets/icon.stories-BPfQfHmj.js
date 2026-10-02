import{j as r}from"./jsx-runtime-DCcQyHCJ.js";import{w as d}from"./iframe-D7mHC4v3.js";import{I as s,s as i}from"./slide.component-B3W_gWZ8.js";import{B as l}from"./button.component-DM1VVw-k.js";import"./card.component-ClB2Fzsz.js";import"./sortableList.component-D64qyQUP.js";import"./icon-text-row.component-DWsMWczK.js";import"./box.component-C0aGEYxD.js";import"./center.component-11mxGLGA.js";import"./grid.component-DearlGU-.js";import"./row.component-A1kB-SW6.js";import"./stack.component-qzxJW6tB.js";import"./wrap.component-C3Qe_feD.js";import"./modal.component-D-HdvdPT.js";import"./switch.component-UEuME6IT.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-BXNJ300A.js";import"./overlay.component-D2WYBsHd.js";import"./background.component-C1FCsZKO.js";import"./text.component-riHEULU0.js";import"./image.component-C9Kx_QaB.js";import"./shadow.style-I4amXsDB.js";import"./padding.style-k3FT0osq.js";import"./index-COjPEtw9.js";import"./index-CVWJ_H_9.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};const $=["IconPlayground","IconManifest"];o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
