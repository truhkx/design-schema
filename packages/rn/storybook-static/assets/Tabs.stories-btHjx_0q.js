import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,o as n,r,t as i}from"./decorators-Dl4455ZU.js";import{l as a}from"./iframe-CAToN8Eb.js";import{n as o,r as s,t as c}from"./Tabs-BByJ8RHl.js";function l(e){return e.map(e=>(0,u.jsx)(c,{id:e.id,children:(0,u.jsx)(r,{children:`${e.label} panel.`})},e.id))}var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{s(),n(),i(),u=a(),d=[{id:`overview`,label:`Overview`},{id:`activity`,label:`Activity`,badge:`3`},{id:`files`,label:`Files`,icon:`external`},{id:`settings`,label:`Settings`,disabled:!0}],f={title:`Tabs/React Native`,component:o,decorators:[t()],args:{label:`Project sections`,tabs:d},render:e=>(0,u.jsx)(o,{...e,children:l(e.tabs)})},p={},m={args:{activation:`automatic`}},h={args:{activation:`manual`}},g={args:{orientation:`horizontal`}},_={args:{orientation:`vertical`}},v={args:{fit:`start`}},y={args:{fit:`fill`}},b={args:{keepMounted:!0}},x={args:{overrides:{radius:`radius.md`,tabPaddingInline:`space.lg`}}},S={args:{activation:`manual`,orientation:`horizontal`,tabs:[{id:`overview`,label:`Overview`},{id:`activity`,label:`Activity`,badge:`3`},{id:`files`,label:`Files`}]},argTypes:{orientation:{control:`inline-radio`,options:[`horizontal`,`vertical`]}}},C={args:{label:`Account sections`,tabs:[{id:`profile`,label:`Profile`},{id:`billing`,label:`Billing`},{id:`security`,label:`Security`}]}},w={args:{label:`Report sections`,tabs:[{id:`summary`,label:`Summary`},{id:`details`,label:`Details`}],activation:`manual`}},T={args:{label:`Settings sections`,tabs:[{id:`general`,label:`General`},{id:`members`,label:`Members`}],orientation:`vertical`}},E={args:{label:`Inbox sections`,tabs:[{id:`inbox`,label:`Inbox`,badge:`3`},{id:`archive`,label:`Archive`}],fit:`fill`,keepMounted:!0}},D=[`Default`,`ActivationAutomatic`,`ActivationManual`,`OrientationHorizontal`,`OrientationVertical`,`FitStart`,`FitFill`,`KeepMounted`,`WithOverrides`,`Keyboard`,`AccountSections`,`ManualActivationForExpensivePanels`,`VerticalTabsBesideTheirPanels`,`FilledTabsWithABadge`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'automatic'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'manual'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    fit: 'start'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    fit: 'fill'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    keepMounted: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      radius: 'radius.md',
      tabPaddingInline: 'space.lg'
    }
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'manual',
    orientation: 'horizontal',
    tabs: [{
      id: 'overview',
      label: 'Overview'
    }, {
      id: 'activity',
      label: 'Activity',
      badge: '3'
    }, {
      id: 'files',
      label: 'Files'
    }]
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical']
    }
  }
}`,...S.parameters?.docs?.source},description:{story:"`activation: manual` with three enabled tabs, for the axe gate and manual keyboard checks on\r\nreact-native-web; `orientation` comes from the args so the vertical rules run against it too.",...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Account sections',
    tabs: [{
      id: 'profile',
      label: 'Profile'
    }, {
      id: 'billing',
      label: 'Billing'
    }, {
      id: 'security',
      label: 'Security'
    }]
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Report sections',
    tabs: [{
      id: 'summary',
      label: 'Summary'
    }, {
      id: 'details',
      label: 'Details'
    }],
    activation: 'manual'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Settings sections',
    tabs: [{
      id: 'general',
      label: 'General'
    }, {
      id: 'members',
      label: 'Members'
    }],
    orientation: 'vertical'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Inbox sections',
    tabs: [{
      id: 'inbox',
      label: 'Inbox',
      badge: '3'
    }, {
      id: 'archive',
      label: 'Archive'
    }],
    fit: 'fill',
    keepMounted: true
  }
}`,...E.parameters?.docs?.source}}}})))()}O();export{C as AccountSections,m as ActivationAutomatic,h as ActivationManual,p as Default,E as FilledTabsWithABadge,y as FitFill,v as FitStart,b as KeepMounted,S as Keyboard,w as ManualActivationForExpensivePanels,g as OrientationHorizontal,_ as OrientationVertical,T as VerticalTabsBesideTheirPanels,x as WithOverrides,D as __namedExportsOrder,f as default};