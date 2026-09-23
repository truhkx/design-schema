import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{T as a}from"./iframe-C6sywzE2.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{t(),r(),a(),o={title:`Meter/Lit`,tags:[`autodocs`],argTypes:{tone:{control:`select`,options:[`info`,`success`,`warning`,`danger`]},value:{control:`number`},min:{control:`number`},max:{control:`number`},valueText:{control:`text`},hideValue:{control:`boolean`}},args:{value:32,min:0,max:100,label:`Storage used`,tone:`info`,hideValue:!1},render:e=>i`
    <ds-meter
      label=${e.label}
      value=${e.value}
      min=${e.min}
      max=${e.max}
      value-text=${n(e.valueText)}
      tone=${e.tone}
      ?hide-value=${e.hideValue}
    ></ds-meter>
  `},s={},c={args:{tone:`info`}},l={args:{tone:`success`}},u={args:{tone:`warning`,value:82}},d={args:{tone:`danger`,value:95}},f={args:{label:`Storage used`,value:32,valueText:`3.2 GB of 10 GB`}},p={args:{label:`Storage used`,value:95,tone:`danger`,valueText:`9.5 GB of 10 GB`}},m={args:{label:`Password strength`,value:3,min:0,max:4,valueText:`Strong`,tone:`success`}},h={args:{label:`Battery`,value:64,hideValue:!0}},g={args:{value:0}},_={args:{value:100}},v={args:{value:150}},y=[`Default`,`ToneInfo`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`StorageQuota`,`NearlyFull`,`PasswordStrength`,`BarOnly`,`Empty`,`Full`,`AboveMaximum`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    value: 82
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    value: 95
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Storage used',
    value: 32,
    valueText: '3.2 GB of 10 GB'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Storage used',
    value: 95,
    tone: 'danger',
    valueText: '9.5 GB of 10 GB'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Password strength',
    value: 3,
    min: 0,
    max: 4,
    valueText: 'Strong',
    tone: 'success'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Battery',
    value: 64,
    hideValue: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    value: 150
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{v as AboveMaximum,h as BarOnly,s as Default,g as Empty,_ as Full,p as NearlyFull,m as PasswordStrength,f as StorageQuota,d as ToneDanger,c as ToneInfo,l as ToneSuccess,u as ToneWarning,y as __namedExportsOrder,o as default};