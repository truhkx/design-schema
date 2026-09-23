import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{g as a}from"./iframe-C6sywzE2.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{t(),r(),a(),o=[{id:`overview`,label:`Overview`},{id:`activity`,label:`Activity`,badge:`3`},{id:`files`,label:`Files`,icon:`external`},{id:`settings`,label:`Settings`,disabled:!0}],s={title:`Tabs/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{activation:{control:`inline-radio`,options:[`automatic`,`manual`],type:{name:`enum`,value:[`automatic`,`manual`]}},orientation:{control:`inline-radio`,options:[`horizontal`,`vertical`],type:{name:`enum`,value:[`horizontal`,`vertical`]}},fit:{control:`inline-radio`,options:[`start`,`fill`],type:{name:`enum`,value:[`start`,`fill`]}},keepMounted:{control:`boolean`},value:{control:`text`},defaultValue:{control:`text`}},args:{label:`Project sections`,tabs:o,activation:`automatic`,orientation:`horizontal`,fit:`start`,keepMounted:!1},render:e=>i`
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
      ${e.tabs.map(e=>i`<ds-tab-panel id=${e.id}>${e.label} panel.</ds-tab-panel>`)}
    </ds-tabs>
  `},c={},l={args:{activation:`automatic`}},u={args:{activation:`manual`}},d={args:{orientation:`horizontal`}},f={args:{orientation:`vertical`}},p={args:{fit:`start`}},m={args:{fit:`fill`,tabs:o.slice(0,3)}},h={args:{keepMounted:!0}},g={args:{value:`activity`}},_={args:{activation:`manual`,tabs:o.slice(0,3)}},v={args:{defaultValue:`files`},render:e=>i`
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
      ${e.tabs.slice(0,2).map(e=>i`<ds-tab-panel id=${e.id}>${e.label} panel.</ds-tab-panel>`)}
    </ds-tabs>
  `},y={args:{label:`Account sections`,tabs:[{id:`profile`,label:`Profile`},{id:`billing`,label:`Billing`},{id:`security`,label:`Security`}]}},b={args:{label:`Report sections`,tabs:[{id:`summary`,label:`Summary`},{id:`details`,label:`Details`}],activation:`manual`}},x={args:{label:`Settings sections`,tabs:[{id:`general`,label:`General`},{id:`members`,label:`Members`}],orientation:`vertical`}},S={args:{label:`Inbox sections`,tabs:[{id:`inbox`,label:`Inbox`,badge:`3`},{id:`archive`,label:`Archive`}],fit:`fill`,keepMounted:!0}},C=[`Default`,`ActivationAutomatic`,`ActivationManual`,`OrientationHorizontal`,`OrientationVertical`,`FitStart`,`FitFill`,`KeepMounted`,`Controlled`,`Keyboard`,`TabWithoutPanel`,`AccountSections`,`ManualActivationForExpensivePanels`,`VerticalTabsBesideTheirPanels`,`FilledTabsWithABadge`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'automatic'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'manual'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    fit: 'start'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    fit: 'fill',
    tabs: TABS.slice(0, 3)
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    keepMounted: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'activity'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'manual',
    tabs: TABS.slice(0, 3)
  }
}`,..._.parameters?.docs?.source},description:{story:"The tab list with three enabled tabs, for the keyboard gate. Manual activation so\r\nEnter/Space selection is observable; `orientation` is read from the story URL\r\n(`args=orientation:vertical`) for the Up/Down rules.",..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'files'
  },
  render: args => html\`
    <ds-tabs
      label=\${args.label}
      .tabs=\${args.tabs}
      value=\${ifDefined(args.value)}
      default-value=\${ifDefined(args.defaultValue)}
      activation=\${args.activation ?? 'automatic'}
      orientation=\${args.orientation ?? 'horizontal'}
      fit=\${args.fit ?? 'start'}
      ?keep-mounted=\${args.keepMounted ?? false}
    >
      \${args.tabs.slice(0, 2).map(tab => html\`<ds-tab-panel id=\${tab.id}>\${tab.label} panel.</ds-tab-panel>\`)}
    </ds-tabs>
  \`
}`,...v.parameters?.docs?.source},description:{story:"A tab without a matching `<ds-tab-panel>` is still rendered; its panel region is empty (dev warning).",...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}}})))()}w();export{y as AccountSections,l as ActivationAutomatic,u as ActivationManual,g as Controlled,c as Default,S as FilledTabsWithABadge,m as FitFill,p as FitStart,h as KeepMounted,_ as Keyboard,b as ManualActivationForExpensivePanels,d as OrientationHorizontal,f as OrientationVertical,v as TabWithoutPanel,x as VerticalTabsBesideTheirPanels,C as __namedExportsOrder,s as default};