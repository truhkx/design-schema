import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{T as a}from"./iframe-DJFLK4ZL.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{t(),r(),a(),o={title:`Meter/Lit`,tags:[`autodocs`],argTypes:{tone:{control:`select`,options:[`info`,`success`,`warning`,`danger`]},value:{control:`number`},min:{control:`number`},max:{control:`number`},valueText:{control:`text`},hideValue:{control:`boolean`}},args:{value:32,min:0,max:100,label:`Storage used`,tone:`info`,hideValue:!1},render:e=>i`
    <ds-meter
      label=${e.label}
      value=${e.value}
      min=${e.min}
      max=${e.max}
      value-text=${n(e.valueText)}
      tone=${e.tone}
      ?hide-value=${e.hideValue}
    ></ds-meter>
  `},s={},c={args:{tone:`info`}},l={args:{tone:`success`}},u={args:{tone:`warning`}},d={args:{tone:`danger`}},f={args:{hideValue:!0}},p={args:{value:150}},m={args:{min:10,max:10,value:10}},h={args:{label:`Storage used`,value:32,valueText:`3.2 GB of 10 GB`}},g={args:{label:`Storage used`,value:95,tone:`danger`,valueText:`9.5 GB of 10 GB`}},_={args:{label:`Password strength`,value:3,min:0,max:4,valueText:`Strong`,tone:`success`}},v={args:{label:`Battery`,value:64,hideValue:!0}},y=[`Default`,`ToneInfo`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`HideValue`,`ClampedAboveMax`,`EmptyRange`,`StorageQuota`,`NearlyFull`,`PasswordStrength`,`BarOnly`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    hideValue: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: 150
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    min: 10,
    max: 10,
    value: 10
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Storage used',
    value: 32,
    valueText: '3.2 GB of 10 GB'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Storage used',
    value: 95,
    tone: 'danger',
    valueText: '9.5 GB of 10 GB'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Password strength',
    value: 3,
    min: 0,
    max: 4,
    valueText: 'Strong',
    tone: 'success'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Battery',
    value: 64,
    hideValue: true
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{v as BarOnly,p as ClampedAboveMax,s as Default,m as EmptyRange,f as HideValue,g as NearlyFull,_ as PasswordStrength,h as StorageQuota,d as ToneDanger,c as ToneInfo,l as ToneSuccess,u as ToneWarning,y as __namedExportsOrder,o as default};