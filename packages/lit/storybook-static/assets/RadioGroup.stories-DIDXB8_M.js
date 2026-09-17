import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{A as a}from"./iframe-DJFLK4ZL.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),r(),a(),o={title:`RadioGroup/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{orientation:{control:`select`,options:[`vertical`,`horizontal`]},required:{control:`boolean`},invalid:{control:`boolean`},disabled:{control:`boolean`}},args:{label:`Shipping method`,name:`shipping`,options:[{value:`standard`,label:`Standard`,description:`Free, 3 to 5 business days`},{value:`express`,label:`Express`,description:`Next business day`},{value:`pickup`,label:`Pick up in store`,description:`Ready in 2 hours`}],value:void 0,defaultValue:void 0,orientation:`vertical`,required:!1,invalid:!1,disabled:!1,description:void 0,error:void 0},render:e=>i`
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
  `},s={},c={args:{orientation:`vertical`}},l={args:{orientation:`horizontal`}},u={args:{required:!0}},d={args:{invalid:!0}},f={args:{disabled:!0,defaultValue:`standard`}},p={args:{description:`Delivery times are estimates.`}},m={args:{error:`Choose a shipping method to continue.`}},h={},g={args:{label:`Shipping method`,name:`shipping`,options:[{value:`standard`,label:`Standard`,description:`Free, 3 to 5 business days`},{value:`express`,label:`Express`,description:`Next business day`},{value:`pickup`,label:`Pick up in store`,description:`Ready in 2 hours`}]}},_={args:{label:`Send a receipt`,name:`receipt`,orientation:`horizontal`,options:[{value:`yes`,label:`Yes`},{value:`no`,label:`No`}]}},v={args:{label:`Plan`,name:`plan`,required:!0,error:`Choose a plan to continue.`,options:[{value:`free`,label:`Free`},{value:`pro`,label:`Pro`}]}},y={args:{label:`Delivery window`,name:`window`,defaultValue:`morning`,options:[{value:`morning`,label:`Morning`},{value:`evening`,label:`Evening`,disabled:!0}]}},b=[`Default`,`OrientationVertical`,`OrientationHorizontal`,`RequiredTrue`,`InvalidTrue`,`DisabledTrue`,`WithDescription`,`ErrorSet`,`Keyboard`,`ShippingMethod`,`HorizontalPair`,`RequiredWithAGroupError`,`WithADisabledOption`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'standard'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Delivery times are estimates.'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Choose a shipping method to continue.'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}}})))()}x();export{s as Default,f as DisabledTrue,m as ErrorSet,_ as HorizontalPair,d as InvalidTrue,h as Keyboard,l as OrientationHorizontal,c as OrientationVertical,u as RequiredTrue,v as RequiredWithAGroupError,g as ShippingMethod,y as WithADisabledOption,p as WithDescription,b as __namedExportsOrder,o as default};