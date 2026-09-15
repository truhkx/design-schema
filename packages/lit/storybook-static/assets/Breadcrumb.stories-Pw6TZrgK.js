import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{T as r}from"./iframe-CsoUKhN4.js";var i,a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{t(),r(),i=[{label:`Docs`,href:`#docs`},{label:`Components`,href:`#components`},{label:`Breadcrumb`}],a=[{label:`Catalogue`,href:`#catalogue`},{label:`Hardware`,href:`#hardware`},{label:`Storage`,href:`#storage`},{label:`Solid state`,href:`#ssd`},{label:`NVMe`,href:`#nvme`},{label:`2 TB`}],o={title:`Breadcrumb/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`navigate`]}},argTypes:{collapse:{control:`boolean`}},args:{items:i,label:`Breadcrumb`,collapse:!0},render:e=>n`
    <ds-breadcrumb
      .items=${e.items}
      label=${e.label}
      ?collapse=${e.collapse}
      @navigate=${e=>e.detail.originalEvent.preventDefault()}
    ></ds-breadcrumb>
  `},s={},c={args:{items:a,collapse:!0}},l={args:{items:a,collapse:!1}},u={args:{items:[{label:`Settings`,href:`#settings`},{label:`Notifications`}]}},d={args:{label:`Catalogue location`,items:a}},f=[`Default`,`CollapseTrue`,`CollapseFalse`,`TwoLevels`,`CustomLabel`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    items: longTrail,
    collapse: true
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    items: longTrail,
    collapse: false
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Settings',
      href: '#settings'
    }, {
      label: 'Notifications'
    }]
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Catalogue location',
    items: longTrail
  }
}`,...d.parameters?.docs?.source}}}})))()}p();export{l as CollapseFalse,c as CollapseTrue,d as CustomLabel,s as Default,u as TwoLevels,f as __namedExportsOrder,o as default};