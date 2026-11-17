import{j as r}from"./jsx-runtime-BFQYTiIK.js";import{w as d}from"./iframe-6sRvOqMq.js";import{I as s,s as i}from"./slide.component-Bf0_q79Y.js";import{B as l}from"./button.component-DP0qUQZ-.js";import"./card.component-pz2opTG_.js";import"./sortableList.component-vdDTJ0a-.js";import"./icon-text-row.component-Bj3BF09W.js";import"./box.component-GEpUB2wK.js";import"./center.component-e37_YclN.js";import"./grid.component-OaPKfzwi.js";import"./row.component-CkgKG1AR.js";import"./stack.component-Yyj6son4.js";import"./wrap.component-DX4NK32L.js";import"./modal.component-Ds3zkeKI.js";import"./switch.component-DERwO7JU.js";import"./preload-helper-PPVm8Dsz.js";import"./theming-BQAouRa3.js";import"./overlay.component-BZzB5R_1.js";import"./background.component-CcNJs86C.js";import"./text.component-DJ-A3fN8.js";import"./image.component-BqwmmIFw.js";import"./shadow.style-2_7Nvy9K.js";import"./padding.style-k3FT0osq.js";import"./index-DizUgHwV.js";import"./index-BrJbHWCw.js";const O={title:"Typography/Icons",component:s},o=n=>r.jsx(s,{...n});o.args={name:i.IconKeys[0],height:48,width:48};const t=()=>{const[n,a]=d.useState(i.IconKeys),c=e=>i.IconKeys.filter(m=>m.toLowerCase().indexOf(e.toLowerCase())>-1),p=async e=>{await navigator.clipboard.writeText(e),alert(`Copied ${e} to clipboard.`)};return r.jsxs("div",{children:[r.jsx("input",{onChange:e=>a(c(e.target.value)),placeholder:"Filter Icons by Name"}),r.jsx("div",{children:n.map(e=>r.jsx(l,{buttonType:"icon",iconName:e,onClick:()=>p(e),children:e}))})]})};o.__docgenInfo={description:"",methods:[],displayName:"IconPlayground",props:{name:{required:!1,tsType:{name:"IconName"},description:""},color:{required:!1,tsType:{name:"ContentColorToken"},description:""},height:{required:!1,tsType:{name:"number"},description:""},width:{required:!1,tsType:{name:"number"},description:""}}};t.__docgenInfo={description:"",methods:[],displayName:"IconManifest"};const $=["IconPlayground","IconManifest"];o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"(args: IconProps) => <Icon {...args} />",...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(): JSX.Element => {
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
