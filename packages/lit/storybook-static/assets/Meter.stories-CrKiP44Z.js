import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Stack-CZSvFm0E.js";import{w as o}from"./iframe-CsoUKhN4.js";var s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{t(),i(),o(),a(),s={title:`Meter/Lit`,tags:[`autodocs`],argTypes:{tone:{control:`select`,options:[`info`,`success`,`warning`,`danger`]},value:{control:{type:`range`,min:0,max:100,step:1}},hideValue:{control:`boolean`}},args:{value:32,min:0,max:100,label:`Storage used`,valueText:`3.2 GB of 10 GB`,tone:`info`,hideValue:!1},render:e=>n`
    <div style="inline-size: min(100%, 24rem)">
      <ds-meter
        label=${e.label}
        value=${e.value}
        min=${e.min}
        max=${e.max}
        value-text=${r(e.valueText)}
        tone=${e.tone}
        ?hide-value=${e.hideValue}
      ></ds-meter>
    </div>
  `},c={},l={args:{tone:`info`}},u={args:{tone:`success`,label:`Password strength`,value:4,min:0,max:4,valueText:`Strong`}},d={args:{tone:`warning`,value:82,valueText:`8.2 GB of 10 GB`}},f={args:{tone:`danger`,value:95,valueText:`9.5 GB of 10 GB`}},p={args:{hideValue:!0}},m={args:{label:`Battery`,value:64,valueText:void 0}},h={args:{label:`Score`,value:7,min:0,max:10,valueText:`7 of 10`,tone:`success`}},g={render:()=>n`
    <ds-stack gap="4" style="inline-size: min(100%, 24rem)">
      <ds-meter label="Documents" value="18" value-text="1.8 GB of 10 GB" tone="info"></ds-meter>
      <ds-meter label="Backups" value="40" value-text="4 GB of 10 GB" tone="success"></ds-meter>
      <ds-meter label="Media" value="82" value-text="8.2 GB of 10 GB" tone="warning"></ds-meter>
      <ds-meter label="Mail" value="97" value-text="9.7 GB of 10 GB" tone="danger"></ds-meter>
    </ds-stack>
  `},_=[`Default`,`ToneInfo`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`HideValue`,`PercentOnly`,`CustomRange`,`Tones`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success',
    label: 'Password strength',
    value: 4,
    min: 0,
    max: 4,
    valueText: 'Strong'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    value: 82,
    valueText: '8.2 GB of 10 GB'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    value: 95,
    valueText: '9.5 GB of 10 GB'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    hideValue: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Battery',
    value: 64,
    valueText: undefined
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Score',
    value: 7,
    min: 0,
    max: 10,
    valueText: '7 of 10',
    tone: 'success'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-stack gap="4" style="inline-size: min(100%, 24rem)">
      <ds-meter label="Documents" value="18" value-text="1.8 GB of 10 GB" tone="info"></ds-meter>
      <ds-meter label="Backups" value="40" value-text="4 GB of 10 GB" tone="success"></ds-meter>
      <ds-meter label="Media" value="82" value-text="8.2 GB of 10 GB" tone="warning"></ds-meter>
      <ds-meter label="Mail" value="97" value-text="9.7 GB of 10 GB" tone="danger"></ds-meter>
    </ds-stack>
  \`
}`,...g.parameters?.docs?.source}}}})))()}v();export{h as CustomRange,c as Default,p as HideValue,m as PercentOnly,f as ToneDanger,l as ToneInfo,u as ToneSuccess,d as ToneWarning,g as Tones,_ as __namedExportsOrder,s as default};