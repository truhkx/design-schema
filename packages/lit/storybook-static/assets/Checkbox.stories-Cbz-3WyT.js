import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Stack-CZci_zJ9.js";import{t as o}from"./Checkbox-DkY-7lZq.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),r(),o(),a(),s={title:`Checkbox/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{hideLabel:{control:`boolean`},defaultChecked:{control:`boolean`},indeterminate:{control:`boolean`},disabled:{control:`boolean`},required:{control:`boolean`},invalid:{control:`boolean`}},args:{label:`Send me product updates`,hideLabel:!1,name:`updates`,value:`on`,defaultChecked:!1,indeterminate:!1,disabled:!1,required:!1,invalid:!1,description:void 0,error:void 0},render:e=>i`
    <ds-checkbox
      label=${e.label}
      name=${e.name}
      value=${e.value}
      description=${n(e.description)}
      error=${n(e.error)}
      ?hide-label=${e.hideLabel}
      ?default-checked=${e.defaultChecked}
      ?indeterminate=${e.indeterminate}
      ?disabled=${e.disabled}
      ?required=${e.required}
      ?invalid=${e.invalid}
    ></ds-checkbox>
  `},c={},l={args:{defaultChecked:!0}},u={args:{indeterminate:!0}},d={args:{disabled:!0}},f={args:{disabled:!0,defaultChecked:!0}},p={args:{required:!0}},m={args:{invalid:!0}},h={args:{hideLabel:!0}},g={args:{error:`Accept the terms to continue.`}},_={args:{label:`I accept the terms of service`,name:`terms`,required:!0}},v={args:{label:`Select all`,name:`selectAll`,indeterminate:!0}},y={args:{label:`Send me product updates`,name:`updates`,description:`One email a month about new features.`}},b={args:{label:`Select row`,name:`select`,hideLabel:!0}},x={render:()=>i`
    <ds-stack>
      <ds-checkbox name="channelEmail" label="Email" default-checked></ds-checkbox>
      <ds-checkbox name="channelSms" label="Text message"></ds-checkbox>
      <ds-checkbox name="channelPush" label="Push notification"></ds-checkbox>
    </ds-stack>
  `},S=[`Default`,`DefaultCheckedTrue`,`IndeterminateTrue`,`DisabledTrue`,`DisabledChecked`,`RequiredTrue`,`InvalidTrue`,`HideLabelTrue`,`ErrorSet`,`Consent`,`SelectAllParent`,`WithDescription`,`SelectionColumn`,`MultiSelect`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    defaultChecked: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    indeterminate: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultChecked: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    hideLabel: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Accept the terms to continue.'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'I accept the terms of service',
    name: 'terms',
    required: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Select all',
    name: 'selectAll',
    indeterminate: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Send me product updates',
    name: 'updates',
    description: 'One email a month about new features.'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Select row',
    name: 'select',
    hideLabel: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-stack>
      <ds-checkbox name="channelEmail" label="Email" default-checked></ds-checkbox>
      <ds-checkbox name="channelSms" label="Text message"></ds-checkbox>
      <ds-checkbox name="channelPush" label="Push notification"></ds-checkbox>
    </ds-stack>
  \`
}`,...x.parameters?.docs?.source}}}})))()}C();export{_ as Consent,c as Default,l as DefaultCheckedTrue,f as DisabledChecked,d as DisabledTrue,g as ErrorSet,h as HideLabelTrue,u as IndeterminateTrue,m as InvalidTrue,x as MultiSelect,p as RequiredTrue,v as SelectAllParent,b as SelectionColumn,y as WithDescription,S as __namedExportsOrder,s as default};