import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{O as a}from"./iframe-CsoUKhN4.js";var o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{t(),i(),a(),o=[{value:`standard`,label:`Standard`,description:`Arrives in 3–5 business days`},{value:`express`,label:`Express`,description:`Arrives in 1–2 business days`},{value:`pickup`,label:`Store pickup`,description:`Ready today`}],s={title:`RadioGroup/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{orientation:{control:`select`,options:[`vertical`,`horizontal`]},required:{control:`boolean`},disabled:{control:`boolean`}},args:{label:`Shipping method`,name:`shipping`,options:o,defaultValue:void 0,orientation:`vertical`,required:!1,disabled:!1,description:void 0,error:void 0},render:e=>n`
    <ds-radio-group
      label=${e.label}
      name=${e.name}
      .options=${e.options}
      default-value=${r(e.defaultValue)}
      orientation=${e.orientation}
      description=${r(e.description)}
      error=${r(e.error)}
      ?required=${e.required}
      ?disabled=${e.disabled}
    ></ds-radio-group>
  `},c={},l={args:{orientation:`vertical`}},u={args:{orientation:`horizontal`,label:`Units`,name:`units`,options:[{value:`metric`,label:`Metric`},{value:`imperial`,label:`Imperial`}],defaultValue:`metric`}},d={args:{defaultValue:`standard`}},f={args:{required:!0}},p={args:{disabled:!0,defaultValue:`standard`}},m={args:{options:[...o.slice(0,2),{value:`pickup`,label:`Store pickup`,description:`Not available in your area`,disabled:!0}]}},h={args:{description:`Delivery times are estimates.`}},g={args:{required:!0,error:`Shipping method is required.`}},_=[`Default`,`OrientationVertical`,`OrientationHorizontal`,`WithDefaultValue`,`RequiredTrue`,`DisabledTrue`,`DisabledOption`,`WithDescription`,`ErrorSet`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
    }],
    defaultValue: 'metric'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'standard'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'standard'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    options: [...shippingOptions.slice(0, 2), {
      value: 'pickup',
      label: 'Store pickup',
      description: 'Not available in your area',
      disabled: true
    }]
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Delivery times are estimates.'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    required: true,
    error: 'Shipping method is required.'
  }
}`,...g.parameters?.docs?.source}}}})))()}v();export{c as Default,m as DisabledOption,p as DisabledTrue,g as ErrorSet,u as OrientationHorizontal,l as OrientationVertical,f as RequiredTrue,d as WithDefaultValue,h as WithDescription,_ as __namedExportsOrder,s as default};