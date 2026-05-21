import{j as t}from"./jsx-runtime-WE-Y9alv.js";import{N as c}from"./iframe-CGP8Q7NU.js";import{a as d,S as l,D as p}from"./sortableList.component-BjVXffLz.js";import{B as u}from"./button.component-jlIFEGxC.js";import"./background.component-DTlD35js.js";import{T as f}from"./text.component-DVfSG_7d.js";import{a as g}from"./slide.component-WcztuaFz.js";import"./image.component-kdvietpY.js";import"./overlay.component-DIoaKtfb.js";import"./theming-E0JevLtx.js";import"./preload-helper-PPVm8Dsz.js";import"./index-B55FBhnZ.js";import"./index-DFgSPJ6s.js";import"./index-DItbHcu_.js";import"./shadow.style-DepDBncF.js";import"./icon-text-row.component-X8nZPUX1.js";import"./proxy-_pZ_mdLg.js";const h=e=>e;function x(e,n=h){return[...new Array(e)].map((a,r)=>n(r))}const S=[{id:"ckj03ha63t2760708sl9i1wrt",name:"Open"},{id:"ckkis9tk41bjc07776r52w8vi",name:"Arrived"},{id:"cl0myohr5153501vkyhdttc84",name:"Completed Workflow"},{id:"ckziqok792091401wchnc8w0x6",name:"Confirmed"},{id:"cl0hr30kt2157201za2zu4z22e",name:"Connect Request"},{id:"cl8ow0o5q14155je153hnxnkep",name:"Service Reminder Response"},{id:"ckkisaejj1bkp0777q7tz03en",name:"Needs Consult"},{id:"cl0hqr4x91927701zaaqtpeq97",name:"Scheduled"},{id:"clalb5upd6062601xqa9ww3zi4",name:"Incoming Triage"},{id:"clcnp56pq489001wka1zxwm0k",name:"Survey Sent"},{id:"clcgj0vp75288301yy99juvg1f",name:"Closed w/comments"},{id:"ckj03ha67t2780708l1lccn1a",name:"Archived"}],J={title:"Components/Draggable/Sortable List",component:d},I=()=>x(50,e=>({id:e+1})),i=()=>{const[e,n]=c.useState(I);return t.jsx(d,{items:e,onChange:n,renderItem:a=>t.jsxs(l,{id:a.id,children:[t.jsx(p,{}),a.id]})})},o=()=>{const[e,n]=c.useState(S),a=r=>n(m=>m.filter(s=>s.id!==r));return t.jsx(d,{items:e,onChange:n,renderItem:({id:r,name:m},s)=>t.jsx(l,{id:r,style:{padding:"8px",background:s&&s%2===0||s===0?"#f1f5f6":"#fff"},children:t.jsxs(g,{align:"center",children:[t.jsx(p,{}),t.jsx(f,{role:"paragraph",children:m}),t.jsx(u,{buttonType:"icon",onClick:()=>a(r),iconName:"trashCanRegular"})]})})})};i.__docgenInfo={description:"",methods:[],displayName:"BasicList"};o.__docgenInfo={description:"",methods:[],displayName:"SortableRows"};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`(): JSX.Element => {
  const [items, setItems] = useState(getMockItems);
  return <SortableList items={items} onChange={setItems} renderItem={(item): JSX.Element => <SortableItem id={item.id}>
          <DragHandle />
          {item.id}
        </SortableItem>} />;
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`(): JSX.Element => {
  const [items, setItems] = useState(findManyChannelStatus);
  const handleRemove = (id: UniqueIdentifier): void => setItems(items => items.filter(item => item.id !== id));
  return <SortableList items={items} onChange={setItems} renderItem={({
    id,
    name
  }, index): JSX.Element => <SortableItem id={id} style={{
    padding: '8px',
    background: index && index % 2 === 0 || index === 0 ? '#f1f5f6' : '#fff'
  }}>
          <Flex align="center">
            <DragHandle />
            <Text role="paragraph">{name}</Text>
            <Button buttonType="icon" onClick={(): void => handleRemove(id)} iconName="trashCanRegular" />
          </Flex>
        </SortableItem>} />;
}`,...o.parameters?.docs?.source}}};const M=["BasicList","SortableRows"];export{i as BasicList,o as SortableRows,M as __namedExportsOrder,J as default};
