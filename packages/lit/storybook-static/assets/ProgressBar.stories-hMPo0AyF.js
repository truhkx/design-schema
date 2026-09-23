import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Stack-CZci_zJ9.js";import{t as o}from"./ProgressBar-lZlYepDX.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{t(),r(),o(),a(),s={title:`ProgressBar/Lit`,tags:[`autodocs`],argTypes:{tone:{control:`select`,options:[`neutral`,`success`,`danger`]},announce:{control:`select`,options:[`none`,`milestones`,`complete`]},value:{control:{type:`range`,min:0,max:100,step:1}},showValue:{control:`boolean`},hideLabel:{control:`boolean`}},parameters:{actions:{handles:[]}},args:{label:`Uploading photos`,value:42,min:0,max:100,showValue:!0,hideLabel:!1,tone:`neutral`,announce:`complete`},render:e=>i`
    <ds-progress-bar
      label=${e.label}
      value=${n(e.value)}
      min=${e.min}
      max=${e.max}
      tone=${e.tone}
      announce=${e.announce}
      ?hide-label=${e.hideLabel}
      ?hide-value=${!e.showValue}
      .formatValue=${e.formatValue}
    ></ds-progress-bar>
  `},c={},l={args:{tone:`neutral`}},u={args:{tone:`success`}},d={args:{tone:`danger`}},f={args:{announce:`none`}},p={args:{announce:`milestones`}},m={args:{announce:`complete`}},h={args:{label:`Uploading photos`,value:42}},g={args:{label:`Importing contacts`,value:10,announce:`milestones`}},_={args:{label:`Export`,value:100,tone:`success`}},v={args:{label:`Rendering preview`,value:60,hideLabel:!0,showValue:!1}},y={args:{value:void 0}},b={args:{hideLabel:!0}},x={args:{showValue:!1}},S={args:{label:`Importing contacts`,value:3,max:12,formatValue:(e,t,n)=>`${e} of ${n} files`}},C={args:{min:50,max:150,value:100}},w={render:()=>i`
    <ds-stack gap="loose">
      <ds-progress-bar label="Uploading photos" value="42"></ds-progress-bar>
      <ds-progress-bar label="Import finished" value="100" tone="success"></ds-progress-bar>
      <ds-progress-bar label="Sync failed" value="58" tone="danger"></ds-progress-bar>
    </ds-stack>
  `},T=[`Default`,`ToneNeutral`,`ToneSuccess`,`ToneDanger`,`AnnounceNone`,`AnnounceMilestones`,`AnnounceComplete`,`Upload`,`LongImport`,`Finished`,`InACard`,`Indeterminate`,`HideLabel`,`ShowValueFalse`,`CustomFormatValue`,`NonZeroMin`,`Tones`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'neutral'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    announce: 'none'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    announce: 'milestones'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    announce: 'complete'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Uploading photos',
    value: 42
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Importing contacts',
    value: 10,
    announce: 'milestones'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Export',
    value: 100,
    tone: 'success'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Rendering preview',
    value: 60,
    hideLabel: true,
    showValue: false
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    value: undefined
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    hideLabel: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: false
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Importing contacts',
    value: 3,
    max: 12,
    formatValue: (value, _min, max) => \`\${value} of \${max} files\`
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    min: 50,
    max: 150,
    value: 100
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-stack gap="loose">
      <ds-progress-bar label="Uploading photos" value="42"></ds-progress-bar>
      <ds-progress-bar label="Import finished" value="100" tone="success"></ds-progress-bar>
      <ds-progress-bar label="Sync failed" value="58" tone="danger"></ds-progress-bar>
    </ds-stack>
  \`
}`,...w.parameters?.docs?.source},description:{story:`The three tones side by side; each is paired with text that says what happened, never colour alone.`,...w.parameters?.docs?.description}}}})))()}E();export{m as AnnounceComplete,p as AnnounceMilestones,f as AnnounceNone,S as CustomFormatValue,c as Default,_ as Finished,b as HideLabel,v as InACard,y as Indeterminate,g as LongImport,C as NonZeroMin,x as ShowValueFalse,d as ToneDanger,l as ToneNeutral,u as ToneSuccess,w as Tones,h as Upload,T as __namedExportsOrder,s as default};