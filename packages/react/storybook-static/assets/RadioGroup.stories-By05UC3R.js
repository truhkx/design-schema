import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./RadioGroup-BMSUDDYt.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{t(),r=[{value:`standard`,label:`Standard`,description:`Free, 3–5 business days`},{value:`express`,label:`Express`,description:`$9, next business day`},{value:`pickup`,label:`Pick up in store`,description:`Free, ready in 2 hours`}],i={title:`RadioGroup/React`,component:n,args:{label:`Shipping method`,name:`shipping`,options:r,orientation:`vertical`,required:!1,invalid:!1,disabled:!1},argTypes:{onChange:{action:`onChange`}}},a={},o={args:{orientation:`vertical`}},s={args:{orientation:`horizontal`,label:`Units`,name:`units`,options:[{value:`metric`,label:`Metric`},{value:`imperial`,label:`Imperial`}]}},c={args:{defaultValue:`standard`}},l={args:{required:!0}},u={args:{disabled:!0,defaultValue:`standard`}},d={args:{options:[...r.slice(0,2),{value:`pickup`,label:`Pick up in store`,description:`Not available in your area`,disabled:!0}]}},f={args:{description:`Delivery times are estimates from the day the order ships.`}},p={args:{invalid:!0}},m={args:{required:!0,error:`Shipping method is required.`}},h={args:{value:`express`}},g=[`Default`,`OrientationVertical`,`OrientationHorizontal`,`WithDefaultValue`,`Required`,`Disabled`,`DisabledOption`,`WithDescription`,`Invalid`,`WithError`,`Controlled`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal',
    label: 'Units',
    name: 'units',
    options: [{
      value: 'metric',
      label: 'Metric'
    }, {
      value: 'imperial',
      label: 'Imperial'
    }]
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'standard'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'standard'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    options: [...shipping.slice(0, 2), {
      value: 'pickup',
      label: 'Pick up in store',
      description: 'Not available in your area',
      disabled: true
    }]
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Delivery times are estimates from the day the order ships.'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    required: true,
    error: 'Shipping method is required.'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'express'
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{h as Controlled,a as Default,u as Disabled,d as DisabledOption,p as Invalid,s as OrientationHorizontal,o as OrientationVertical,l as Required,c as WithDefaultValue,f as WithDescription,m as WithError,g as __namedExportsOrder,i as default};