import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./decorators-Dl4455ZU.js";import{n as r,t as i}from"./Meter-C4NRsBbv.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{r(),n(),a={title:`Meter/React Native`,component:i,decorators:[t()],args:{label:`Storage used`,value:32,min:0,max:100,valueText:`3.2 GB of 10 GB`,tone:`info`,hideValue:!1}},o={},s={args:{tone:`info`}},c={args:{tone:`success`,label:`Password strength`,value:4,max:4,valueText:`Strong`}},l={args:{tone:`warning`,value:82,valueText:`8.2 GB of 10 GB`}},u={args:{tone:`danger`,value:95,valueText:`9.5 GB of 10 GB`}},d={args:{valueText:void 0,value:64}},f={args:{hideValue:!0}},p={args:{label:`Score`,value:7,min:0,max:10,valueText:`7 of 10`,tone:`success`}},m={args:{value:140,valueText:void 0,tone:`danger`}},h={args:{label:`Storage used`,value:32,valueText:`3.2 GB of 10 GB`}},g={args:{label:`Storage used`,value:95,tone:`danger`,valueText:`9.5 GB of 10 GB`}},_={args:{label:`Password strength`,value:3,min:0,max:4,valueText:`Strong`,tone:`success`}},v={args:{label:`Battery`,value:64,hideValue:!0}},y=[`Default`,`ToneInfo`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`Percentage`,`HideValue`,`CustomRange`,`Overflow`,`StorageQuota`,`NearlyFull`,`PasswordStrength`,`BarOnly`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success',
    label: 'Password strength',
    value: 4,
    max: 4,
    valueText: 'Strong'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    value: 82,
    valueText: '8.2 GB of 10 GB'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    value: 95,
    valueText: '9.5 GB of 10 GB'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    valueText: undefined,
    value: 64
  }
}`,...d.parameters?.docs?.source},description:{story:"Without `valueText` the percentage is shown and announced.",...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    hideValue: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Score',
    value: 7,
    min: 0,
    max: 10,
    valueText: '7 of 10',
    tone: 'success'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: 140,
    valueText: undefined,
    tone: 'danger'
  }
}`,...m.parameters?.docs?.source},description:{story:`Values outside the range are clamped for both the bar and the accessible value.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Storage used',
    value: 32,
    valueText: '3.2 GB of 10 GB'
  }
}`,...h.parameters?.docs?.source},description:{story:`A quota whose value text is what a person would say aloud, not a percentage.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Storage used',
    value: 95,
    tone: 'danger',
    valueText: '9.5 GB of 10 GB'
  }
}`,...g.parameters?.docs?.source},description:{story:`The consumer raises the tone from a threshold it owns and says why in the value text.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Password strength',
    value: 3,
    min: 0,
    max: 4,
    valueText: 'Strong',
    tone: 'success'
  }
}`,..._.parameters?.docs?.source},description:{story:`A word rather than a number, on a short scale of its own.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Battery',
    value: 64,
    hideValue: true
  }
}`,...v.parameters?.docs?.source},description:{story:`A meter in a dense row, where the value text would repeat the copy beside it.`,...v.parameters?.docs?.description}}}})))()}b();export{v as BarOnly,p as CustomRange,o as Default,f as HideValue,g as NearlyFull,m as Overflow,_ as PasswordStrength,d as Percentage,h as StorageQuota,u as ToneDanger,s as ToneInfo,c as ToneSuccess,l as ToneWarning,y as __namedExportsOrder,a as default};