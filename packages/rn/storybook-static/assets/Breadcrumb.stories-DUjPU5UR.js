import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./decorators-Dl4455ZU.js";import{n as r,t as i}from"./Breadcrumb-DxTucsuC.js";var a,o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{r(),n(),a={title:`Breadcrumb/React Native`,component:i,decorators:[t()],args:{items:[{label:`Docs`,href:`/docs`},{label:`Components`,href:`/docs/components`},{label:`Breadcrumb`}],label:`Breadcrumb`,collapse:!0}},o={},s=[{label:`Docs`,href:`/docs`},{label:`Components`,href:`/docs/components`},{label:`Navigation`,href:`/docs/components/navigation`},{label:`Breadcrumb`,href:`/docs/components/navigation/breadcrumb`},{label:`Keyboard`}],c={args:{collapse:!0,items:s}},l={args:{collapse:!1,items:s}},u={args:{items:[{label:`Docs`,href:`/docs`},{label:`Reference`},{label:`Tokens`}]}},d={args:{items:[{label:`Settings`,href:`/settings`},{label:`Notifications`,href:`/settings/notifications`},{label:`Email digest`}]}},f={args:{collapse:!0,items:s}},p={args:{collapse:!1,items:[{label:`Catalogue`,href:`/catalogue`},{label:`Outdoor`,href:`/catalogue/outdoor`},{label:`Tents`}]}},m={args:{label:`Catalogue breadcrumb`,items:[{label:`Catalogue`,href:`/catalogue`},{label:`Tents`}]}},h=[`Default`,`CollapseTrue`,`CollapseFalse`,`AncestorWithoutHref`,`SettingsTrail`,`DeepTrailCollapsed`,`AlwaysInFull`,`SecondBreadcrumbOnAPage`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    collapse: true,
    items: deepTrail
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    collapse: false,
    items: deepTrail
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Docs',
      href: '/docs'
    }, {
      label: 'Reference'
    }, {
      label: 'Tokens'
    }]
  }
}`,...u.parameters?.docs?.source},description:{story:"An ancestor without `href` renders as plain text, not an empty link.",...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source},description:{story:`A short trail whose last item is the current page, rendered as text.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    collapse: true,
    items: deepTrail
  }
}`,...f.parameters?.docs?.source},description:{story:`A trail of more than four items, folded to the first, an ellipsis and the last two.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source},description:{story:`A trail short enough that the ellipsis would only cost the reader a click.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Catalogue breadcrumb',
    items: [{
      label: 'Catalogue',
      href: '/catalogue'
    }, {
      label: 'Tents'
    }]
  }
}`,...m.parameters?.docs?.source},description:{story:`A second trail, named so the two navigation landmarks are distinguishable.`,...m.parameters?.docs?.description}}}})))()}g();export{p as AlwaysInFull,u as AncestorWithoutHref,l as CollapseFalse,c as CollapseTrue,f as DeepTrailCollapsed,o as Default,m as SecondBreadcrumbOnAPage,d as SettingsTrail,h as __namedExportsOrder,a as default};