import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{E as r}from"./iframe-DJFLK4ZL.js";var i,a,o,s,c,l,u;function d(){return(d=e((()=>{t(),r(),i={title:`Breadcrumb/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`navigate`]}},argTypes:{collapse:{control:`boolean`}},args:{items:[{label:`Docs`,href:`/docs`},{label:`Components`,href:`/docs/components`},{label:`Breadcrumb`}],label:`Breadcrumb`,collapse:!0},render:e=>n`
    <ds-breadcrumb
      .items=${e.items}
      label=${e.label}
      ?no-collapse=${!e.collapse}
      @navigate=${e=>e.preventDefault()}
    ></ds-breadcrumb>
  `},a={},o={args:{items:[{label:`Settings`,href:`/settings`},{label:`Notifications`,href:`/settings/notifications`},{label:`Email digest`}]}},s={args:{collapse:!0,items:[{label:`Docs`,href:`/docs`},{label:`Components`,href:`/docs/components`},{label:`Navigation`,href:`/docs/components/navigation`},{label:`Breadcrumb`,href:`/docs/components/navigation/breadcrumb`},{label:`Keyboard`}]}},c={args:{collapse:!1,items:[{label:`Catalogue`,href:`/catalogue`},{label:`Outdoor`,href:`/catalogue/outdoor`},{label:`Tents`}]}},l={args:{label:`Catalogue breadcrumb`,items:[{label:`Catalogue`,href:`/catalogue`},{label:`Tents`}]}},u=[`Default`,`SettingsTrail`,`DeepTrailCollapsed`,`AlwaysInFull`,`SecondBreadcrumbOnAPage`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Settings',
      href: '/settings'
    }, {
      label: 'Notifications',
      href: '/settings/notifications'
    }, {
      label: 'Email digest'
    }]
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    collapse: true,
    items: [{
      label: 'Docs',
      href: '/docs'
    }, {
      label: 'Components',
      href: '/docs/components'
    }, {
      label: 'Navigation',
      href: '/docs/components/navigation'
    }, {
      label: 'Breadcrumb',
      href: '/docs/components/navigation/breadcrumb'
    }, {
      label: 'Keyboard'
    }]
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    collapse: false,
    items: [{
      label: 'Catalogue',
      href: '/catalogue'
    }, {
      label: 'Outdoor',
      href: '/catalogue/outdoor'
    }, {
      label: 'Tents'
    }]
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Catalogue breadcrumb',
    items: [{
      label: 'Catalogue',
      href: '/catalogue'
    }, {
      label: 'Tents'
    }]
  }
}`,...l.parameters?.docs?.source}}}})))()}d();export{c as AlwaysInFull,s as DeepTrailCollapsed,a as Default,l as SecondBreadcrumbOnAPage,o as SettingsTrail,u as __namedExportsOrder,i as default};