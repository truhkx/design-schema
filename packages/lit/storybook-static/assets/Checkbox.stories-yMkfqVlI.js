import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Stack-CZSvFm0E.js";import{t as o}from"./Checkbox-D_Ve3Y-V.js";var s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{t(),i(),o(),a(),s={title:`Checkbox/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{defaultChecked:{control:`boolean`},indeterminate:{control:`boolean`},disabled:{control:`boolean`},required:{control:`boolean`}},args:{label:`Send me product updates`,name:`updates`,value:`on`,defaultChecked:!1,indeterminate:!1,disabled:!1,required:!1,description:void 0,error:void 0},render:e=>n`
    <ds-checkbox
      label=${e.label}
      name=${e.name}
      value=${e.value}
      description=${r(e.description)}
      error=${r(e.error)}
      ?default-checked=${e.defaultChecked}
      ?indeterminate=${e.indeterminate}
      ?disabled=${e.disabled}
      ?required=${e.required}
    ></ds-checkbox>
  `},c={},l={args:{defaultChecked:!0}},u={args:{indeterminate:!0,label:`Select all`,name:`all`}},d={args:{disabled:!0}},f={args:{disabled:!0,defaultChecked:!0}},p={args:{required:!0,label:`I agree to the terms`,name:`terms`}},m={args:{description:`About one email a month. Unsubscribe any time.`}},h={args:{required:!0,label:`I agree to the terms`,name:`terms`,error:`Accept the terms to create your account.`}},g={render:()=>n`
    <ds-stack gap="0">
      <ds-checkbox name="channels" value="email" label="Email" default-checked></ds-checkbox>
      <ds-checkbox name="channels" value="sms" label="Text message"></ds-checkbox>
      <ds-checkbox name="channels" value="push" label="Push notification"></ds-checkbox>
    </ds-stack>
  `},_=[`Default`,`DefaultCheckedTrue`,`IndeterminateTrue`,`DisabledTrue`,`DisabledChecked`,`RequiredTrue`,`WithDescription`,`ErrorSet`,`MultiSelect`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    defaultChecked: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    indeterminate: true,
    label: 'Select all',
    name: 'all'
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
    required: true,
    label: 'I agree to the terms',
    name: 'terms'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'About one email a month. Unsubscribe any time.'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    required: true,
    label: 'I agree to the terms',
    name: 'terms',
    error: 'Accept the terms to create your account.'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-stack gap="0">
      <ds-checkbox name="channels" value="email" label="Email" default-checked></ds-checkbox>
      <ds-checkbox name="channels" value="sms" label="Text message"></ds-checkbox>
      <ds-checkbox name="channels" value="push" label="Push notification"></ds-checkbox>
    </ds-stack>
  \`
}`,...g.parameters?.docs?.source}}}})))()}v();export{c as Default,l as DefaultCheckedTrue,f as DisabledChecked,d as DisabledTrue,h as ErrorSet,u as IndeterminateTrue,g as MultiSelect,p as RequiredTrue,m as WithDescription,_ as __namedExportsOrder,s as default};