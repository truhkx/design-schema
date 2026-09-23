import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,r,t as i}from"./Tabs-CzCMftRJ.js";function a(e){return e.map(e=>(0,o.jsxs)(i,{id:e.id,children:[e.label,` panel.`]},e.id))}var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{r(),o=t(),s=[{id:`overview`,label:`Overview`},{id:`activity`,label:`Activity`,badge:`3`},{id:`files`,label:`Files`,icon:`external`},{id:`settings`,label:`Settings`,disabled:!0}],c={title:`Tabs/React`,component:n,args:{tabs:s,label:`Project sections`,activation:`automatic`,orientation:`horizontal`,fit:`start`,keepMounted:!1,children:a(s)},argTypes:{activation:{control:`inline-radio`,options:[`automatic`,`manual`],type:{name:`enum`,value:[`automatic`,`manual`]}},orientation:{control:`inline-radio`,options:[`horizontal`,`vertical`],type:{name:`enum`,value:[`horizontal`,`vertical`]}},fit:{control:`inline-radio`,options:[`start`,`fill`],type:{name:`enum`,value:[`start`,`fill`]}},onChange:{action:`onChange`}},tags:[`autodocs`]},l={},u={args:{activation:`automatic`}},d={args:{activation:`manual`}},f={args:{orientation:`horizontal`}},p={args:{orientation:`vertical`}},m={args:{fit:`start`}},h={args:{fit:`fill`,tabs:s.slice(0,3),children:a(s.slice(0,3))}},g={args:{keepMounted:!0}},_={args:{value:`activity`}},v={args:{activation:`manual`,tabs:s.slice(0,3),children:a(s.slice(0,3))}},y={args:{defaultValue:`files`,children:a(s.slice(0,2))}},b=[{id:`profile`,label:`Profile`},{id:`billing`,label:`Billing`},{id:`security`,label:`Security`}],x={args:{label:`Account sections`,tabs:b,children:a(b)}},S=[{id:`summary`,label:`Summary`},{id:`details`,label:`Details`}],C={args:{label:`Report sections`,tabs:S,activation:`manual`,children:a(S)}},w=[{id:`general`,label:`General`},{id:`members`,label:`Members`}],T={args:{label:`Settings sections`,tabs:w,orientation:`vertical`,children:a(w)}},E=[{id:`inbox`,label:`Inbox`,badge:`3`},{id:`archive`,label:`Archive`}],D={args:{label:`Inbox sections`,tabs:E,fit:`fill`,keepMounted:!0,children:a(E)}},O=[`Default`,`ActivationAutomatic`,`ActivationManual`,`OrientationHorizontal`,`OrientationVertical`,`FitStart`,`FitFill`,`KeepMounted`,`Controlled`,`Keyboard`,`TabWithoutPanel`,`AccountSections`,`ManualActivationForExpensivePanels`,`VerticalTabsBesideTheirPanels`,`FilledTabsWithABadge`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'automatic'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'manual'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    fit: 'start'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    fit: 'fill',
    tabs: TABS.slice(0, 3),
    children: panelsFor(TABS.slice(0, 3))
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    keepMounted: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'activity'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'manual',
    tabs: TABS.slice(0, 3),
    children: panelsFor(TABS.slice(0, 3))
  }
}`,...v.parameters?.docs?.source},description:{story:"Manual activation over three enabled tabs; takes `orientation` from its args (story URL).",...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'files',
    children: panelsFor(TABS.slice(0, 2))
  }
}`,...y.parameters?.docs?.source},description:{story:`A tab without a matching TabPanel is still rendered; its panel region is empty (dev warning).`,...y.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Account sections',
    tabs: ACCOUNT,
    children: panelsFor(ACCOUNT)
  }
}`,...x.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Report sections',
    tabs: REPORT,
    activation: 'manual',
    children: panelsFor(REPORT)
  }
}`,...C.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Settings sections',
    tabs: SETTINGS,
    orientation: 'vertical',
    children: panelsFor(SETTINGS)
  }
}`,...T.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Inbox sections',
    tabs: INBOX,
    fit: 'fill',
    keepMounted: true,
    children: panelsFor(INBOX)
  }
}`,...D.parameters?.docs?.source}}}})))()}k();export{x as AccountSections,u as ActivationAutomatic,d as ActivationManual,_ as Controlled,l as Default,D as FilledTabsWithABadge,h as FitFill,m as FitStart,g as KeepMounted,v as Keyboard,C as ManualActivationForExpensivePanels,f as OrientationHorizontal,p as OrientationVertical,y as TabWithoutPanel,T as VerticalTabsBesideTheirPanels,O as __namedExportsOrder,c as default};