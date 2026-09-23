import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{A as a}from"./iframe-C6sywzE2.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),r(),a(),o={title:`RadioGroup/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{orientation:{control:`select`,options:[`vertical`,`horizontal`]},required:{control:`boolean`},invalid:{control:`boolean`},disabled:{control:`boolean`}},args:{label:`Shipping method`,name:`shipping`,options:[{value:`standard`,label:`Standard`,description:`Free, 3 to 5 business days`},{value:`express`,label:`Express`,description:`Next business day`},{value:`pickup`,label:`Pick up in store`,description:`Ready in 2 hours`}],value:void 0,defaultValue:void 0,orientation:`vertical`,required:!1,invalid:!1,disabled:!1,description:void 0,error:void 0},render:e=>i`
    <ds-radio-group
      label=${e.label}
      name=${e.name}
      .options=${e.options}
      value=${n(e.value)}
      default-value=${n(e.defaultValue)}
      orientation=${e.orientation}
      description=${n(e.description)}
      error=${n(e.error)}
      ?required=${e.required}
      ?invalid=${e.invalid}
      ?disabled=${e.disabled}
    ></ds-radio-group>
  `},s={},c={args:{orientation:`vertical`}},l={args:{orientation:`horizontal`,label:`Send a receipt`,name:`receipt`,options:[{value:`yes`,label:`Yes`},{value:`no`,label:`No`}]}},u={args:{label:`Shipping method`,name:`shipping`,options:[{value:`standard`,label:`Standard`,description:`Free, 3 to 5 business days`},{value:`express`,label:`Express`,description:`Next business day`},{value:`pickup`,label:`Pick up in store`,description:`Ready in 2 hours`}]}},d={args:{label:`Send a receipt`,name:`receipt`,orientation:`horizontal`,options:[{value:`yes`,label:`Yes`},{value:`no`,label:`No`}]}},f={args:{label:`Plan`,name:`plan`,required:!0,error:`Choose a plan to continue.`,options:[{value:`free`,label:`Free`},{value:`pro`,label:`Pro`}]}},p={args:{label:`Delivery window`,name:`window`,defaultValue:`morning`,options:[{value:`morning`,label:`Morning`},{value:`evening`,label:`Evening`,disabled:!0}]}},m={},h={args:{required:!0}},g={args:{invalid:!0}},_={args:{disabled:!0,defaultValue:`standard`}},v={args:{description:`Delivery times are estimates from the day the order ships.`}},y={args:{value:`express`}},b=[`Default`,`OrientationVertical`,`OrientationHorizontal`,`ShippingMethod`,`HorizontalPair`,`RequiredWithAGroupError`,`WithADisabledOption`,`Keyboard`,`Required`,`Invalid`,`Disabled`,`WithDescription`,`Controlled`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal',
    label: 'Send a receipt',
    name: 'receipt',
    options: [{
      value: 'yes',
      label: 'Yes'
    }, {
      value: 'no',
      label: 'No'
    }]
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Shipping method',
    name: 'shipping',
    options: [{
      value: 'standard',
      label: 'Standard',
      description: 'Free, 3 to 5 business days'
    }, {
      value: 'express',
      label: 'Express',
      description: 'Next business day'
    }, {
      value: 'pickup',
      label: 'Pick up in store',
      description: 'Ready in 2 hours'
    }]
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Send a receipt',
    name: 'receipt',
    orientation: 'horizontal',
    options: [{
      value: 'yes',
      label: 'Yes'
    }, {
      value: 'no',
      label: 'No'
    }]
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Plan',
    name: 'plan',
    required: true,
    error: 'Choose a plan to continue.',
    options: [{
      value: 'free',
      label: 'Free'
    }, {
      value: 'pro',
      label: 'Pro'
    }]
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Delivery window',
    name: 'window',
    defaultValue: 'morning',
    options: [{
      value: 'morning',
      label: 'Morning'
    }, {
      value: 'evening',
      label: 'Evening',
      disabled: true
    }]
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'standard'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Delivery times are estimates from the day the order ships.'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'express'
  }
}`,...y.parameters?.docs?.source}}}})))()}x();export{y as Controlled,s as Default,_ as Disabled,d as HorizontalPair,g as Invalid,m as Keyboard,l as OrientationHorizontal,c as OrientationVertical,h as Required,f as RequiredWithAGroupError,u as ShippingMethod,p as WithADisabledOption,v as WithDescription,b as __namedExportsOrder,o as default};