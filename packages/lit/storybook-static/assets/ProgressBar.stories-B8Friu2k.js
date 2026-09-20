import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Stack-CZci_zJ9.js";import{t as o}from"./ProgressBar-kimtruKq.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{t(),r(),o(),a(),s={title:`ProgressBar/Lit`,tags:[`autodocs`],argTypes:{tone:{control:`select`,options:[`neutral`,`success`,`danger`]},announce:{control:`select`,options:[`none`,`milestones`,`complete`]},value:{control:{type:`range`,min:0,max:100,step:1}},showValue:{control:`boolean`},hideLabel:{control:`boolean`}},parameters:{actions:{handles:[]}},args:{label:`Uploading photos`,value:42,min:0,max:100,showValue:!0,hideLabel:!1,tone:`neutral`,announce:`complete`},render:e=>i`
    <ds-progress-bar
      label=${e.label}
      value=${n(e.value)}
      min=${e.min}
      max=${e.max}
      tone=${e.tone}
      announce=${e.announce}
      ?hide-label=${e.hideLabel}
      ?hide-value=${!e.showValue}
    ></ds-progress-bar>
  `},c={},l={args:{tone:`neutral`}},u={args:{tone:`success`}},d={args:{tone:`danger`}},f={args:{announce:`none`}},p={args:{announce:`milestones`}},m={args:{announce:`complete`}},h={args:{value:void 0}},g={args:{hideLabel:!0}},_={args:{showValue:!1}},v={args:{label:`Uploading photos`,value:42}},y={args:{label:`Importing contacts`,value:10,announce:`milestones`}},b={args:{label:`Export`,value:100,tone:`success`}},x={args:{label:`Rendering preview`,value:60,hideLabel:!0,showValue:!1}},S={render:()=>i`
    <ds-stack gap="loose">
      <ds-progress-bar label="Uploading photos" value="42"></ds-progress-bar>
      <ds-progress-bar label="Import finished" value="100" tone="success"></ds-progress-bar>
      <ds-progress-bar label="Sync failed" value="58" tone="danger"></ds-progress-bar>
    </ds-stack>
  `},C=[`Default`,`ToneNeutral`,`ToneSuccess`,`ToneDanger`,`AnnounceNone`,`AnnounceMilestones`,`AnnounceComplete`,`Indeterminate`,`HideLabel`,`HideValue`,`Upload`,`LongImport`,`Finished`,`InACard`,`Tones`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
    value: undefined
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    hideLabel: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: false
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Uploading photos',
    value: 42
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Importing contacts',
    value: 10,
    announce: 'milestones'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Export',
    value: 100,
    tone: 'success'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Rendering preview',
    value: 60,
    hideLabel: true,
    showValue: false
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-stack gap="loose">
      <ds-progress-bar label="Uploading photos" value="42"></ds-progress-bar>
      <ds-progress-bar label="Import finished" value="100" tone="success"></ds-progress-bar>
      <ds-progress-bar label="Sync failed" value="58" tone="danger"></ds-progress-bar>
    </ds-stack>
  \`
}`,...S.parameters?.docs?.source}}}})))()}w();export{m as AnnounceComplete,p as AnnounceMilestones,f as AnnounceNone,c as Default,b as Finished,g as HideLabel,_ as HideValue,x as InACard,h as Indeterminate,y as LongImport,d as ToneDanger,l as ToneNeutral,u as ToneSuccess,S as Tones,v as Upload,C as __namedExportsOrder,s as default};