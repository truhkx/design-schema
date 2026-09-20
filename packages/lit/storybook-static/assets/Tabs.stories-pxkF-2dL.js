import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{g as a}from"./iframe-B0T1LYjz.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),r(),a(),o={title:`Tabs/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{activation:{control:`select`,options:[`automatic`,`manual`]},orientation:{control:`select`,options:[`horizontal`,`vertical`]},fit:{control:`select`,options:[`start`,`fill`]},keepMounted:{control:`boolean`},value:{control:`text`},defaultValue:{control:`text`}},args:{label:`Project sections`,tabs:[{id:`overview`,label:`Overview`},{id:`activity`,label:`Activity`,badge:`3`},{id:`files`,label:`Files`},{id:`members`,label:`Members`,disabled:!0}],activation:`automatic`,orientation:`horizontal`,fit:`start`,keepMounted:!1},render:e=>i`
    <ds-tabs
      label=${e.label}
      .tabs=${e.tabs}
      value=${n(e.value)}
      default-value=${n(e.defaultValue)}
      activation=${e.activation??`automatic`}
      orientation=${e.orientation??`horizontal`}
      fit=${e.fit??`start`}
      ?keep-mounted=${e.keepMounted??!1}
    >
      ${e.tabs.map(e=>i`<ds-tab-panel id=${e.id}>${e.label}</ds-tab-panel>`)}
    </ds-tabs>
  `},s={},c={args:{activation:`automatic`}},l={args:{activation:`manual`}},u={args:{orientation:`horizontal`}},d={args:{orientation:`vertical`}},f={args:{fit:`start`}},p={args:{fit:`fill`}},m={args:{keepMounted:!0}},h={args:{defaultValue:`activity`}},g={args:{value:`files`}},_={args:{tabs:[{id:`overview`,label:`Overview`},{id:`activity`,label:`Activity`},{id:`files`,label:`Files`}],activation:`manual`}},v={args:{label:`Account sections`,tabs:[{id:`profile`,label:`Profile`},{id:`billing`,label:`Billing`},{id:`security`,label:`Security`}]}},y={args:{label:`Report sections`,tabs:[{id:`summary`,label:`Summary`},{id:`details`,label:`Details`}],activation:`manual`}},b={args:{label:`Settings sections`,tabs:[{id:`general`,label:`General`},{id:`members`,label:`Members`}],orientation:`vertical`}},x={args:{label:`Inbox sections`,tabs:[{id:`inbox`,label:`Inbox`,badge:`3`},{id:`archive`,label:`Archive`}],fit:`fill`,keepMounted:!0}},S=[`Default`,`ActivationAutomatic`,`ActivationManual`,`OrientationHorizontal`,`OrientationVertical`,`FitStart`,`FitFill`,`KeepMounted`,`WithDefaultValue`,`Controlled`,`Keyboard`,`AccountSections`,`ManualActivationForExpensivePanels`,`VerticalTabsBesideTheirPanels`,`FilledTabsWithABadge`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'automatic'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'manual'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    fit: 'start'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    fit: 'fill'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    keepMounted: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'activity'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'files'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    tabs: [{
      id: 'overview',
      label: 'Overview'
    }, {
      id: 'activity',
      label: 'Activity'
    }, {
      id: 'files',
      label: 'Files'
    }],
    activation: 'manual'
  }
}`,..._.parameters?.docs?.source},description:{story:"The tab list with three enabled tabs, for the keyboard gate. Manual activation so\r\nEnter/Space selection is observable; `orientation` is read from the story URL\r\n(`args=orientation:vertical`) for the Up/Down rules.",..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}}})))()}C();export{v as AccountSections,c as ActivationAutomatic,l as ActivationManual,g as Controlled,s as Default,x as FilledTabsWithABadge,p as FitFill,f as FitStart,m as KeepMounted,_ as Keyboard,y as ManualActivationForExpensivePanels,u as OrientationHorizontal,d as OrientationVertical,b as VerticalTabsBesideTheirPanels,h as WithDefaultValue,S as __namedExportsOrder,o as default};